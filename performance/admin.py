from django.contrib import admin
from .models import PerformanceReview, Goal


@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = ['employee', 'reviewer', 'review_date', 'score', 'goal_progress', 'status']
    list_filter = ['status', 'review_date']
    search_fields = ['employee__first_name', 'employee__last_name']
    date_hierarchy = 'review_date'
    readonly_fields = ['review_id', 'created_at', 'updated_at']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['employee', 'title', 'status', 'progress_percentage', 'start_date', 'end_date']
    list_filter = ['status', 'start_date']
    search_fields = ['title', 'employee__first_name', 'employee__last_name']
    readonly_fields = ['goal_id', 'created_at', 'updated_at']
