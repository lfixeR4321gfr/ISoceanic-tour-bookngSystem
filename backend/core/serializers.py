from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Booking, Tour


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs.get("username"), password=attrs.get("password"))
        if not user:
            raise serializers.ValidationError({"error": "Invalid credentials"})
        attrs["user"] = user
        return attrs


class TourSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="name", read_only=True)

    class Meta:
        model = Tour
        fields = [
            "id",
            "title",
            "name",
            "description",
            "price",
            "duration_days",
            "available_slots",
            "tour_date",
            "tour_time",
        ]


class BookingCreateSerializer(serializers.Serializer):
    tour_id = serializers.IntegerField()
    number_of_people = serializers.IntegerField(min_value=1)
    client_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=20)
    travel_date = serializers.DateField(required=False, allow_null=True)


class BookingSerializer(serializers.ModelSerializer):
    tour = TourSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "tour",
            "number_of_people",
            "client_name",
            "email",
            "phone_number",
            "travel_date",
            "booking_date",
        ]
