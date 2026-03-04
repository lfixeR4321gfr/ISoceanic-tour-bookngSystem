"""URL configuration for the core application - API endpoints."""
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.api_register, name='api_register'),
    path('login/', views.api_login, name='api_login'),
    path('tours/', views.api_tours, name='api_tours'),
    path('bookings/', views.api_bookings, name='api_bookings'),
    path('my-bookings/', views.api_my_bookings, name='api_my_bookings'),
    
    # Admin endpoints
    path('admin/tours/', views.api_admin_tours, name='api_admin_tours'),
    path('admin/tours/<int:tour_id>/', views.api_admin_tour_detail, name='api_admin_tour_detail'),
    path('admin/bookings/', views.api_admin_bookings, name='api_admin_bookings'),
    path('admin/bookings/<int:booking_id>/', views.api_admin_booking_detail, name='api_admin_booking_detail'),
]
