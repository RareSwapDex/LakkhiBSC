from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

# Create main router for campaigns
router = DefaultRouter()
router.register(r'campaigns', views.CampaignViewSet, basename='campaign')

# Create nested routers for campaign-related resources
campaign_router = NestedDefaultRouter(router, r'campaigns', lookup='campaign')
campaign_router.register(r'contributions', views.ContributionViewSet, basename='campaign-contribution')
campaign_router.register(r'milestones', views.MilestoneViewSet, basename='campaign-milestone')
campaign_router.register(r'releases', views.ReleaseViewSet, basename='campaign-release')
campaign_router.register(r'updates', views.UpdateViewSet, basename='campaign-update')
campaign_router.register(r'comments', views.CommentViewSet, basename='campaign-comment')

# Keep existing URL patterns
urlpatterns = [
    path('api/create_campaign/', views.create_campaign, name='create_campaign'),
    path('api/create_project/', views.create_project, name='create_project'),
    path('api/campaigns/', views.campaigns, name='campaigns'),
    path('api/campaigns/<int:id>/', views.campaign_detail, name='campaign_detail'),
    path('api/projects/<int:project_id>/update/', views.update_project, name='update_project'),
    path('api/wallet/create/', views.create_wallet, name='create_wallet'),
    path('api/campaign/<int:id>/contract', views.campaign_contract, name='campaign_contract'),
    path('api/token/<address>/price', views.token_price, name='token_price'),
    path('api/campaign/<int:id>/stakeflow', views.campaign_stakeflow, name='campaign_stakeflow'),
    path('api/payment/process/', views.payment_process, name='payment_process'),
    path('api/mercuryo/callback/', views.mercuryo_callback, name='mercuryo_callback'),
    path('api/campaigns/<int:campaign_id>/analytics/export/', views.export_analytics, name='export-analytics'),
    
    # Include router URLs
    path('api/', include(router.urls)),
    path('api/', include(campaign_router.urls)),
] 