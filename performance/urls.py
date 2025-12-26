from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PerformanceReviewViewSet, GoalViewSet

router = DefaultRouter()
router.register(r'performance-reviews', PerformanceReviewViewSet, basename='performance-review')
router.register(r'goals', GoalViewSet, basename='goal')

urlpatterns = [
    path('', include(router.urls)),
]

