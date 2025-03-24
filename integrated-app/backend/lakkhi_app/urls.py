from django.urls import path
from . import views

urlpatterns = [
    # API root
    path('', views.api_root, name='api_root'),
    
    # Project listing and details
    path('api/projects/', views.projects_list, name='projects_list'),
    path('api/projects/<int:id>/', views.projects_details_by_id, name='projects_details_by_id'),
    
    # Project incentives
    path('api/incentives/<int:project_id>/', views.incentives, name='incentives'),
    
    # Project creation and management (admin)
    path('api/projects/add/', views.add_project, name='add_project'),
    path('api/projects/<int:project_id>/publish/', views.publish_project, name='publish_project'),
    
    # Wallet and payment processing
    path('api/wallet/create/', views.create_wallet, name='create_wallet'),
    path('api/payment/process/', views.process_payment, name='process_payment'),
    path('api/payment/mercuryo/callback/', views.mercuryo_callback, name='mercuryo_callback'),
] 