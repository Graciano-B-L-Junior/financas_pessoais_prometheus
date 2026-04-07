from django.contrib import admin
from .models import Categoria, Transacao

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tipo')
    list_filter = ('tipo',)
    search_fields = ('nome',)

@admin.register(Transacao)
class TransacaoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tipo', 'valor', 'data', 'categoria', 'usuario')
    list_filter = ('tipo', 'categoria', 'data')
    search_fields = ('nome', 'descricao')
