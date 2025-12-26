import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type { Employee, PerformanceReview, Goal } from '../types';

type PerformanceTab = 'reviews' | 'goals';

const reviewStatuses = ['Draft', 'Submitted', 'Approved', 'Rejected'];
const goalStatuses = ['Not Started', 'In Progress', 'Completed', 'Cancelled'];

const PerformancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PerformanceTab>('reviews');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [reviewForm, setReviewForm] = useState({
    employee: '',
    reviewer: '',
    review_date: '',
    review_period_start: '',
    review_period_end: '',
    rating: '',
    feedback: '',
    goal_progress: '',
    strengths: '',
    areas_for_improvement: '',
    recommendations: '',
    status: 'Draft',
  });

  const [goalForm, setGoalForm] = useState({
    employee: '',
    title: '',
    description: '',
    target_value: '',
    current_value: '',
    unit: '',
    start_date: '',
    end_date: '',
    status: 'Not Started',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchEmployees(), fetchReviews(), fetchGoals()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const normalizeList = (data: any) => data?.results ?? data ?? [];

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/');
      setEmployees(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch employees');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get('/performance/reviews/');
      setReviews(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch reviews');
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await api.get('/performance/goals/');
      setGoals(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch goals');
    }
  };

  const resetReviewForm = () => {
    setReviewForm({
      employee: '',
      reviewer: '',
      review_date: '',
      review_period_start: '',
      review_period_end: '',
      rating: '',
      feedback: '',
      goal_progress: '',
      strengths: '',
      areas_for_improvement: '',
      recommendations: '',
      status: 'Draft',
    });
    setEditingReview(null);
  };

  const resetGoalForm = () => {
    setGoalForm({
      employee: '',
      title: '',
      description: '',
      target_value: '',
      current_value: '',
      unit: '',
      start_date: '',
      end_date: '',
      status: 'Not Started',
    });
    setEditingGoal(null);
  };

  const handleReviewSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      employee: parseInt(reviewForm.employee, 10),
      reviewer: reviewForm.reviewer ? parseInt(reviewForm.reviewer, 10) : null,
      review_date: reviewForm.review_date,
      review_period_start: reviewForm.review_period_start,
      review_period_end: reviewForm.review_period_end,
      score: parseFloat(reviewForm.rating),
      feedback: reviewForm.feedback,
      goal_progress: parseFloat(reviewForm.goal_progress || '0'),
      strengths: reviewForm.strengths || null,
      areas_for_improvement: reviewForm.areas_for_improvement || null,
      recommendations: reviewForm.recommendations || null,
      status: reviewForm.status,
    };

    try {
      if (editingReview) {
        await api.patch(`/performance/reviews/${editingReview.review_id}/`, payload);
        toast.success('Performance review updated');
      } else {
        await api.post('/performance/reviews/', payload);
        toast.success('Performance review created');
      }
      setShowReviewModal(false);
      resetReviewForm();
      fetchReviews();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save performance review');
    }
  };

  const handleGoalSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      employee: parseInt(goalForm.employee, 10),
      title: goalForm.title,
      description: goalForm.description,
      target_value: goalForm.target_value ? parseFloat(goalForm.target_value) : null,
      current_value: parseFloat(goalForm.current_value || '0'),
      unit: goalForm.unit || null,
      start_date: goalForm.start_date,
      end_date: goalForm.end_date,
      status: goalForm.status,
    };

    try {
      if (editingGoal) {
        await api.patch(`/performance/goals/${editingGoal.goal_id}/`, payload);
        toast.success('Goal updated');
      } else {
        await api.post('/performance/goals/', payload);
        toast.success('Goal created');
      }
      setShowGoalModal(false);
      resetGoalForm();
      fetchGoals();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save goal');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Delete this review?')) {
      return;
    }
    try {
      await api.delete(`/performance/reviews/${reviewId}/`);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete review');
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!window.confirm('Delete this goal?')) {
      return;
    }
    try {
      await api.delete(`/performance/goals/${goalId}/`);
      toast.success('Goal deleted');
      fetchGoals();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete goal');
    }
  };

  const startEditReview = (review: PerformanceReview) => {
    setEditingReview(review);
    setReviewForm({
      employee: review.employee.toString(),
      reviewer: review.reviewer ? review.reviewer.toString() : '',
      review_date: review.review_date,
      review_period_start: review.review_period_start,
      review_period_end: review.review_period_end,
      rating: review.score.toString(),
      feedback: review.feedback,
      goal_progress: review.goal_progress?.toString() || '',
      strengths: review.strengths || '',
      areas_for_improvement: review.areas_for_improvement || '',
      recommendations: review.recommendations || '',
      status: review.status,
    });
    setShowReviewModal(true);
  };

  const startEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalForm({
      employee: goal.employee.toString(),
      title: goal.title,
      description: goal.description,
      target_value: goal.target_value?.toString() || '',
      current_value: goal.current_value.toString(),
      unit: goal.unit || '',
      start_date: goal.start_date,
      end_date: goal.end_date,
      status: goal.status,
    });
    setShowGoalModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
          <p className="text-gray-600 mt-1">Manage reviews and goals</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'reviews' && (
            <button
              onClick={() => {
                resetReviewForm();
                setShowReviewModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Review
            </button>
          )}
          {activeTab === 'goals' && (
            <button
              onClick={() => {
                resetGoalForm();
                setShowGoalModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Goal
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'reviews' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Performance Reviews
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'goals' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Goals
        </button>
      </div>

      {activeTab === 'reviews' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Review Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.review_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{review.employee_name || review.employee}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{review.review_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{review.score}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{review.status}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditReview(review)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.review_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Goal</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {goals.map((goal) => (
                  <tr key={goal.goal_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{goal.employee_name || goal.employee}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{goal.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{goal.progress_percentage ?? 0}%</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{goal.status}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditGoal(goal)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.goal_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {goals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No goals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingReview ? 'Edit Review' : 'Add Review'}
              </h2>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  resetReviewForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                  <select
                    required
                    value={reviewForm.employee}
                    onChange={(event) => setReviewForm({ ...reviewForm, employee: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.employee_id} value={employee.employee_id}>
                        {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer</label>
                  <select
                    value={reviewForm.reviewer}
                    onChange={(event) => setReviewForm({ ...reviewForm, reviewer: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select reviewer</option>
                    {employees.map((employee) => (
                      <option key={employee.employee_id} value={employee.employee_id}>
                        {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review Date</label>
                  <input
                    type="date"
                    required
                    value={reviewForm.review_date}
                    onChange={(event) => setReviewForm({ ...reviewForm, review_date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Period Start</label>
                  <input
                    type="date"
                    required
                    value={reviewForm.review_period_start}
                    onChange={(event) => setReviewForm({ ...reviewForm, review_period_start: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Period End</label>
                  <input
                    type="date"
                    required
                    value={reviewForm.review_period_end}
                    onChange={(event) => setReviewForm({ ...reviewForm, review_period_end: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={reviewForm.rating}
                    onChange={(event) => setReviewForm({ ...reviewForm, rating: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal Progress</label>
                  <input
                    type="number"
                    step="0.01"
                    value={reviewForm.goal_progress}
                    onChange={(event) => setReviewForm({ ...reviewForm, goal_progress: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                <textarea
                  required
                  value={reviewForm.feedback}
                  onChange={(event) => setReviewForm({ ...reviewForm, feedback: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Strengths</label>
                  <textarea
                    value={reviewForm.strengths}
                    onChange={(event) => setReviewForm({ ...reviewForm, strengths: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Areas for Improvement</label>
                  <textarea
                    value={reviewForm.areas_for_improvement}
                    onChange={(event) => setReviewForm({ ...reviewForm, areas_for_improvement: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                <textarea
                  value={reviewForm.recommendations}
                  onChange={(event) => setReviewForm({ ...reviewForm, recommendations: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={reviewForm.status}
                  onChange={(event) => setReviewForm({ ...reviewForm, status: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {reviewStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    resetReviewForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingReview ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingGoal ? 'Edit Goal' : 'Add Goal'}
              </h2>
              <button
                onClick={() => {
                  setShowGoalModal(false);
                  resetGoalForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleGoalSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select
                  required
                  value={goalForm.employee}
                  onChange={(event) => setGoalForm({ ...goalForm, employee: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.employee_id} value={employee.employee_id}>
                      {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={goalForm.title}
                  onChange={(event) => setGoalForm({ ...goalForm, title: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={goalForm.description}
                  onChange={(event) => setGoalForm({ ...goalForm, description: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalForm.target_value}
                    onChange={(event) => setGoalForm({ ...goalForm, target_value: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalForm.current_value}
                    onChange={(event) => setGoalForm({ ...goalForm, current_value: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <input
                    type="text"
                    value={goalForm.unit}
                    onChange={(event) => setGoalForm({ ...goalForm, unit: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    required
                    value={goalForm.start_date}
                    onChange={(event) => setGoalForm({ ...goalForm, start_date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    required
                    value={goalForm.end_date}
                    onChange={(event) => setGoalForm({ ...goalForm, end_date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={goalForm.status}
                    onChange={(event) => setGoalForm({ ...goalForm, status: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {goalStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowGoalModal(false);
                    resetGoalForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingGoal ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePage;
