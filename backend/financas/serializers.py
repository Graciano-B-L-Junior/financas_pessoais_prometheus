from rest_framework import serializers
from .models import Categoria, Transacao


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'tipo']


class TransacaoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all(), source='categoria', write_only=True)

    class Meta:
        model = Transacao
        fields = ['id', 'nome', 'descricao', 'valor', 'data', 'tipo', 'categoria', 'categoria_id']

    def create(self, validated_data):
        usuario = self.context['request'].user
        validated_data['usuario'] = usuario
        return super().create(validated_data)
