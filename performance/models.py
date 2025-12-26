from django.db import models
from employees.models import Employee


class PerformanceReview(models.Model):
    """Performance review model"""
    review_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='performance_reviews'
    )
    review_date = models.DateField()
    reviewer = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviews_given'
    )
    review_period_start = models.DateField()
    review_period_end = models.DateField()
    score = models.DecimalField(max_digits=5, decimal_places=2)
    feedback = models.TextField()
    goal_progress = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    strengths = models.TextField(blank=True, null=True)
    areas_for_improvement = models.TextField(blank=True, null=True)
    recommendations = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('Draft', 'Draft'),
            ('Submitted', 'Submitted'),
            ('Approved', 'Approved'),
            ('Rejected', 'Rejected'),
        ],
        default='Draft'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'performance_reviews'
        ordering = ['-review_date']

    def __str__(self):
        return f"{self.employee.full_name} - Review {self.review_date}"


class Goal(models.Model):
    """Performance goals model"""
    goal_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='goals'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    target_value = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    current_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    unit = models.CharField(max_length=50, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('Not Started', 'Not Started'),
            ('In Progress', 'In Progress'),
            ('Completed', 'Completed'),
            ('Cancelled', 'Cancelled'),
        ],
        default='Not Started'
    )
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'goals'
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.title}"

    def calculate_progress(self):
        """Calculate progress percentage"""
        if self.target_value and self.target_value > 0:
            progress = (self.current_value / self.target_value) * 100
            return min(progress, 100.00)
        return 0.00

    def save(self, *args, **kwargs):
        self.progress_percentage = self.calculate_progress()
        if self.progress_percentage >= 100:
            self.status = 'Completed'
        elif self.progress_percentage > 0:
            self.status = 'In Progress'
        super().save(*args, **kwargs)
