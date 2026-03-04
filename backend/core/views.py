"""Views for the core application - Template + API views."""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .forms import UserRegisterForm, BookingForm
from .models import Tour, Booking
import json

def with_cors(response, request):
    origin = request.headers.get("Origin", "*")
    response["Access-Control-Allow-Origin"] = origin
    response["Vary"] = "Origin"
    response["Access-Control-Allow-Methods"] = "GET, POST, PUT, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


# Helper function to authenticate using token
def get_user_from_token(request):
    from rest_framework.authtoken.models import Token
    auth_header = request.headers.get('Authorization', '')
    
    if not auth_header.startswith('Token '):
        return None
    
    token_key = auth_header.replace('Token ', '')
    
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return None


# ===============================
# TEMPLATE VIEWS
# ===============================

def home(request):
    return render(request, 'core/home.html')


@login_required
def available_tours(request):
    tours = Tour.objects.filter(available_slots__gt=0)
    return render(request, 'core/available_tours.html', {'tours': tours})


def register_view(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password1'])
            user.save()
            messages.success(request, 'Registration successful! You can now log in.')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'core/register.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        username_or_email = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username_or_email, password=password)
        if not user:
            try:
                u = User.objects.get(email=username_or_email)
                user = authenticate(request, username=u.username, password=password)
            except User.DoesNotExist:
                user = None
        if user:
            login(request, user)
            return redirect('available_tours')
        else:
            messages.error(request, 'Invalid username/email or password.')
    return render(request, 'core/login.html')


@login_required
def logout_view(request):
    logout(request)
    return redirect('home')


@login_required
def book_tour(request, tour_id):
    tour = get_object_or_404(Tour, id=tour_id)
    if request.method == 'POST':
        form = BookingForm(request.POST)
        if form.is_valid():
            booking = form.save(commit=False)
            booking.client = request.user
            booking.tour = tour
            if booking.number_of_people > tour.available_slots:
                form.add_error('number_of_people', 'Not enough available slots.')
            else:
                tour.available_slots -= booking.number_of_people
                tour.save()
                booking.save()
                messages.success(request, 'Booking successful!')
                return redirect('dashboard')
    else:
        form = BookingForm()
    return render(request, 'core/booking.html', {'form': form, 'tour': tour})


@login_required
def dashboard(request):
    bookings = Booking.objects.filter(client=request.user).select_related('tour')
    return render(request, 'core/dashboard.html', {'bookings': bookings})


# ===============================
# API VIEWS FOR REACT FRONTEND
# ===============================

@csrf_exempt
def api_register(request):
    """API endpoint for user registration."""
    if request.method == "OPTIONS":
        return with_cors(JsonResponse({}, status=200), request)

    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except:
            return with_cors(JsonResponse({"error": "Invalid JSON"}, status=400), request)
        
        username = data.get("username")
        password = data.get("password")
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        email = data.get("email", "")
        
        if not username or not password:
            return with_cors(JsonResponse({"error": "Username and password required"}, status=400), request)
        
        if User.objects.filter(username=username).exists():
            return with_cors(JsonResponse({"error": "Username already exists"}, status=400), request)
        
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email
        )
        
        return with_cors(JsonResponse({"message": "Registration successful", "user_id": user.id}), request)
    
    return with_cors(JsonResponse({"error": "Invalid request"}, status=400), request)


@csrf_exempt
def api_login(request):
    """API endpoint for user login with token authentication."""
    if request.method == "OPTIONS":
        return with_cors(JsonResponse({}, status=200), request)

    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except:
            return with_cors(JsonResponse({"error": "Invalid JSON"}, status=400), request)
        
        username = data.get("username")
        password = data.get("password")
        
        user = authenticate(username=username, password=password)
        
        if user:
            from rest_framework.authtoken.models import Token
            token, _ = Token.objects.get_or_create(user=user)
            return with_cors(JsonResponse({
                "message": "Login successful",
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
                "is_staff": user.is_staff
            }), request)
        else:
            return with_cors(JsonResponse({"error": "Invalid credentials"}, status=400), request)
    
    return with_cors(JsonResponse({"error": "Invalid request"}, status=400), request)


def api_tours(request):
    """API endpoint to get all available tours."""
    tours = Tour.objects.all()
    data = []
    for tour in tours:
        data.append({
            "id": tour.id,
            "title": tour.name,
            "name": tour.name,
            "description": tour.description,
            "price": str(tour.price),
            "duration_days": tour.duration_days,
            "available_slots": tour.available_slots,
            "tour_date": str(tour.tour_date) if tour.tour_date else None,
            "tour_time": str(tour.tour_time) if tour.tour_time else None,
        })
    return JsonResponse(data, safe=False)


@csrf_exempt
def api_bookings(request):
    """API endpoint to create a new booking with DRF token authentication."""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"error": "Authentication credentials were not provided"}, status=401)
    
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        
        tour_id = data.get("tour_id")
        number_of_people = data.get("number_of_people")
        client_name = data.get("client_name", "")
        email = data.get("email", "")
        phone_number = data.get("phone_number", "")
        travel_date = data.get("travel_date", None)
        
        if not tour_id or not number_of_people:
            return JsonResponse({"error": "tour_id and number_of_people required"}, status=400)
        
        if not client_name or not email or not phone_number:
            return JsonResponse({"error": "client_name, email, and phone_number are required"}, status=400)
        
        try:
            tour = Tour.objects.get(id=tour_id)
        except Tour.DoesNotExist:
            return JsonResponse({"error": "Tour not found"}, status=404)
        
        if number_of_people > tour.available_slots:
            return JsonResponse({"error": "Not enough available slots"}, status=400)
        
        booking = Booking.objects.create(
            client=user,
            tour=tour,
            number_of_people=number_of_people,
            client_name=client_name,
            email=email,
            phone_number=phone_number,
            travel_date=travel_date,
        )
        
        tour.available_slots -= number_of_people
        tour.save()
        
        return JsonResponse({
            "message": "Booking successful",
            "booking_id": booking.id
        })
    
    return JsonResponse({"error": "Invalid request"}, status=400)


def api_my_bookings(request):
    """API endpoint to get user's bookings with DRF token authentication."""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"error": "Authentication credentials were not provided"}, status=401)
    
    bookings = Booking.objects.filter(client=user).select_related('tour')
    data = []
    for booking in bookings:
        data.append({
            "id": booking.id,
            "tour": {
                "id": booking.tour.id,
                "name": booking.tour.name,
                "description": booking.tour.description,
                "price": str(booking.tour.price),
            },
            "number_of_people": booking.number_of_people,
            "client_name": booking.client_name,
            "email": booking.email,
            "booking_date": booking.booking_date.isoformat() if booking.booking_date else None,
            "travel_date": str(booking.travel_date) if booking.travel_date else None,
        })
    return JsonResponse(data, safe=False)


# ===============================
# ADMIN API VIEWS
# ===============================

def api_admin_tours(request):
    """API endpoint to get all tours (admin view)."""
    user = get_user_from_token(request)
    if not user or not user.is_staff:
        return JsonResponse({"error": "Admin access required"}, status=403)
    
    tours = Tour.objects.all()
    data = []
    for tour in tours:
        data.append({
            "id": tour.id,
            "name": tour.name,
            "description": tour.description,
            "price": str(tour.price),
            "duration_days": tour.duration_days,
            "available_slots": tour.available_slots,
            "tour_date": str(tour.tour_date) if tour.tour_date else None,
            "tour_time": str(tour.tour_time) if tour.tour_time else None,
        })
    return JsonResponse(data, safe=False)


def api_admin_tour_detail(request, tour_id):
    """API endpoint to get/update a single tour (admin view)."""
    user = get_user_from_token(request)
    if not user or not user.is_staff:
        return JsonResponse({"error": "Admin access required"}, status=403)
    
    try:
        tour = Tour.objects.get(id=tour_id)
    except Tour.DoesNotExist:
        return JsonResponse({"error": "Tour not found"}, status=404)
    
    if request.method == "GET":
        return JsonResponse({
            "id": tour.id,
            "name": tour.name,
            "description": tour.description,
            "price": str(tour.price),
            "duration_days": tour.duration_days,
            "available_slots": tour.available_slots,
            "tour_date": str(tour.tour_date) if tour.tour_date else None,
            "tour_time": str(tour.tour_time) if tour.tour_time else None,
        })
    
    if request.method == "PUT" or request.method == "POST":
        try:
            data = json.loads(request.body)
        except:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        
        tour.name = data.get("name", tour.name)
        tour.description = data.get("description", tour.description)
        tour.price = data.get("price", tour.price)
        tour.duration_days = data.get("duration_days", tour.duration_days)
        tour.available_slots = data.get("available_slots", tour.available_slots)
        
        if "tour_date" in data and data["tour_date"]:
            tour.tour_date = data["tour_date"]
        if "tour_time" in data and data["tour_time"]:
            tour.tour_time = data["tour_time"]
        
        tour.save()
        
        return JsonResponse({
            "message": "Tour updated successfully",
            "tour": {
                "id": tour.id,
                "name": tour.name,
                "price": str(tour.price),
            }
        })
    
    return JsonResponse({"error": "Invalid request"}, status=400)


def api_admin_bookings(request):
    """API endpoint to get all bookings (admin view)."""
    user = get_user_from_token(request)
    if not user or not user.is_staff:
        return JsonResponse({"error": "Admin access required"}, status=403)
    
    bookings = Booking.objects.select_related('tour', 'client').all()
    data = []
    for booking in bookings:
        data.append({
            "id": booking.id,
            "client_name": booking.client_name,
            "email": booking.email,
            "phone_number": booking.phone_number,
            "tour": {
                "id": booking.tour.id,
                "name": booking.tour.name,
                "price": str(booking.tour.price),
            },
            "number_of_people": booking.number_of_people,
            "travel_date": str(booking.travel_date) if booking.travel_date else None,
            "booking_date": booking.booking_date.isoformat() if booking.booking_date else None,
        })
    return JsonResponse(data, safe=False)
