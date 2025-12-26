from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import PerformanceReview, Goal
from .serializers import PerformanceReviewSerializer, GoalSerializer
from employees.permissions import RolePermission


class PerformanceReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing performance reviews
    """
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [RolePermission]
    permission_required = 'performance.manage'
    read_permission = 'performance.view'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__first_name', 'employee__last_name']
    filterset_fields = ['employee', 'reviewer', 'status']
    ordering_fields = ['review_date', 'created_at']
    ordering = ['-review_date']


class GoalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing goals
    """
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [RolePermission]
    permission_required = 'performance.manage'
    read_permission = 'performance.view'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'employee__first_name', 'employee__last_name']
    filterset_fields = ['employee', 'status']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']
