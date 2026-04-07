import io
import openpyxl
from django_filters import rest_framework as filters
from rest_framework import viewsets, permissions, status
from rest_framework.filters import SearchFilter
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Categoria, Transacao
from .serializers import CategoriaSerializer, TransacaoSerializer


class TransacaoFilter(filters.FilterSet):
    nome = filters.CharFilter(field_name='nome', lookup_expr='icontains')
    categoria_id = filters.NumberFilter(field_name='categoria__id')
    data_min = filters.DateFilter(field_name='data', lookup_expr='gte')
    data_max = filters.DateFilter(field_name='data', lookup_expr='lte')

    class Meta:
        model = Transacao
        fields = ['nome', 'categoria_id', 'data_min', 'data_max', 'tipo']


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['nome']


class TransacaoViewSet(viewsets.ModelViewSet):
    queryset = Transacao.objects.select_related('categoria').all()
    serializer_class = TransacaoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend, SearchFilter]
    filterset_class = TransacaoFilter
    search_fields = ['nome', 'descricao']

    def get_queryset(self):
        return self.queryset.filter(usuario=self.request.user)


class ImportXlsxView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'detail': 'Arquivo XLSX é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            workbook = openpyxl.load_workbook(filename=io.BytesIO(file_obj.read()), data_only=True)
            sheet = workbook.active
        except Exception as exc:
            return Response({'detail': f'Falha ao abrir XLSX: {exc}'}, status=status.HTTP_400_BAD_REQUEST)

        rows = list(sheet.iter_rows(values_only=True))
        if len(rows) < 2:
            return Response({'detail': 'A planilha deve conter cabeçalho e pelo menos uma linha de dados.'}, status=status.HTTP_400_BAD_REQUEST)

        headers = [str(cell).strip().lower() for cell in rows[0]]
        expected = ['nome', 'descricao', 'valor', 'data', 'tipo', 'categoria']
        missing = [field for field in expected if field not in headers]
        if missing:
            return Response({'detail': f'Cabeçalhos ausentes: {missing}'}, status=status.HTTP_400_BAD_REQUEST)

        created = 0
        errors = []
        for index, row in enumerate(rows[1:], start=2):
            data = dict(zip(headers, row))
            nome = data.get('nome')
            if not nome:
                errors.append({'linha': index, 'erro': 'Nome é obrigatório'})
                continue

            tipo = str(data.get('tipo') or '').strip().lower()
            if tipo not in [Categoria.RECEITA, Categoria.DESPESA]:
                errors.append({'linha': index, 'erro': 'Tipo deve ser receita ou despesa'})
                continue

            categoria_nome = str(data.get('categoria') or '').strip()
            if not categoria_nome:
                errors.append({'linha': index, 'erro': 'Categoria é obrigatória'})
                continue

            categoria, _ = Categoria.objects.get_or_create(nome=categoria_nome, tipo=tipo)

            try:
                transacao = Transacao.objects.create(
                    nome=nome,
                    descricao=str(data.get('descricao') or ''),
                    valor=float(data.get('valor') or 0),
                    data=data.get('data'),
                    tipo=tipo,
                    categoria=categoria,
                    usuario=request.user,
                )
                created += 1
            except Exception as exc:
                errors.append({'linha': index, 'erro': str(exc)})

        return Response({'created': created, 'errors': errors})
