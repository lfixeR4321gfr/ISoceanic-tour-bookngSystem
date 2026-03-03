from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

# Optional: client profile inahifadhi data za user kama first name, last name, nationality
class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    #nationality = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    def __str__(self):
        return self.first_name or self.user.username

# Tour model
class Tour(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField()
    available_slots = models.PositiveIntegerField(default=0)
    tour_date = models.DateField(default=timezone.now)
    tour_time = models.TimeField(default=timezone.now)

    def __str__(self):
        return self.name


# Booking model
class Booking(models.Model):
    client = models.ForeignKey(User, on_delete=models.CASCADE)
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    number_of_people = models.PositiveIntegerField(default=1)

    # Extra fields for storing client info at booking time
    client_name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    
    # Date when the client wants to travel
    travel_date = models.DateField(null=True, blank=True)
    # Date and time when the booking was made (auto-recorded)
    booking_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.client.username} - {self.tour.name}"
