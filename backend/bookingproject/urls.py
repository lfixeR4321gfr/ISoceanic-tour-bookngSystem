"""
URL configuration for bookingproject project.
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include

urlpatterns = [
    path('', lambda request: JsonResponse({
        'status': 'ok',
        'message': 'Booking backend is running',
        'endpoints': ['/health/', '/api/', '/admin/'],
    }), name='root'),
    path('health/', lambda request: JsonResponse({'status': 'ok'}), name='health'),
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
]
