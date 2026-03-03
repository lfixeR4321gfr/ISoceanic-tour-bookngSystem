from django.contrib import admin
from .models import Tour, Booking

# Customize Booking admin display
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'client_name', 'tour', 'number_of_people', 'email', 'phone_number', 'travel_date', 'booking_date')
    list_filter = ('tour', 'booking_date')
    search_fields = ('client_name', 'email', 'phone_number')
    ordering = ('-booking_date',)

# Customize Tour admin display
class TourAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price', 'duration_days', 'available_slots', 'tour_date')
    list_filter = ('tour_date',)
    search_fields = ('name', 'description')

admin.site.register(Tour, TourAdmin)
admin.site.register(Booking, BookingAdmin)
