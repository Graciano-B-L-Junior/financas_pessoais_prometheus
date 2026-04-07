from django.conf import settings
from django.db import models


class Categoria(models.Model):
    RECEITA = 'receita'
    DESPESA = 'despesa'
    TIPO_CHOICES = [
        (RECEITA, 'Receita'),
        (DESPESA, 'Despesa'),
    ]

    nome = models.CharField(max_length=120)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'

    def __str__(self):
        return f'{self.nome} ({self.tipo})'


class Transacao(models.Model):
    nome = models.CharField(max_length=180)
    descricao = models.TextField(blank=True)
    valor = models.DecimalField(max_digits=12, decimal_places=2)
    data = models.DateField()
    tipo = models.CharField(max_length=10, choices=Categoria.TIPO_CHOICES)
    categoria = models.ForeignKey(Categoria, related_name='transacoes', on_delete=models.CASCADE)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='transacoes', on_delete=models.CASCADE)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-data', '-criado_em']

    def __str__(self):
        return f'{self.nome} - {self.valor} ({self.tipo})'
