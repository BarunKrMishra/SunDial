from rest_framework import serializers
from .models import PerformanceReview, Goal
from employees.serializers import EmployeeListSerializer


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.full_name', read_only=True)

    class Meta:
        model = PerformanceReview
        fields = [
            'review_id', 'employee', 'employee_name', 'review_date',
            'reviewer', 'reviewer_name', 'review_period_start',
            'review_period_end', 'score', 'feedback', 'goal_progress',
            'strengths', 'areas_for_improvement', 'recommendations',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['review_id', 'created_at', 'updated_at']


class GoalSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    progress_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = Goal
        fields = [
            'goal_id', 'employee', 'employee_name', 'title', 'description',
            'target_value', 'current_value', 'unit', 'start_date',
            'end_date', 'status', 'progress_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['goal_id', 'progress_percentage', 'created_at', 'updated_at']

