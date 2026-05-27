from django.urls import path

from . import views

urlpatterns = [
    path('<str:model_name>/', views.api_list, name='api_list'),
    path('<str:model_name>/<str:pk>/', views.api_detail, name='api_detail'),
]
