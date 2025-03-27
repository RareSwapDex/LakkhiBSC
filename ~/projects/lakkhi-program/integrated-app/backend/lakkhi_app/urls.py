from django.urls import path
from . import views

urlpatterns = [
    path('api/', views.api_root, name='api-root'),
    path('api/projects/', views.projects_list, name='projects-list'),
    path('api/projects/<int:id>/', views.projects_details_by_id, name='project-detail'),
    path('api/projects/add/', views.add_project, name='add-project'),
    path('api/projects/<int:project_id>/publish/', views.publish_project, name='publish-project'),
    path('api/projects/<int:project_id>/donate/', views.donate_to_project, name='donate-to-project'),
    path('api/projects/<int:project_id>/contributions/', views.project_contributions, name='project-contributions'),
    path('api/token/validate/', views.token_validate, name='token-validate'),
    path('api/token/price/', views.token_price, name='token-price'),
    path('api/staking-abi/', views.staking_abi, name='staking-abi'),
    path('api/staking-bytecode/', views.staking_bytecode, name='staking-bytecode'),
] 