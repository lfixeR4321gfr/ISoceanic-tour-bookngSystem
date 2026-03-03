"""Forms for the core application."""
from django import forms
from django.contrib.auth.models import User
from .models import Booking

# -----------------------------
# User Registration Form
# -----------------------------
class UserRegisterForm(forms.ModelForm):
    first_name = forms.CharField(max_length=50)
    last_name = forms.CharField(max_length=50)
    email = forms.EmailField()

    password1 = forms.CharField(widget=forms.PasswordInput)
    password2 = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get("password1") != cleaned_data.get("password2"):
            raise forms.ValidationError("Passwords do not match")


# -----------------------------
# Booking Form
# -----------------------------
class BookingForm(forms.ModelForm):
    travel_date = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
        required=False,
        help_text="Select the date you want to travel"
    )
    
    class Meta:
        model = Booking
        fields = ['client_name', 'phone_number', 'email', 'number_of_people', 'travel_date']

    # optional: customize widgets
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['client_name'].widget.attrs.update({'class': 'form-control'})
        self.fields['phone_number'].widget.attrs.update({'class': 'form-control'})
        self.fields['email'].widget.attrs.update({'class': 'form-control'})
        self.fields['number_of_people'].widget.attrs.update({'class': 'form-control', 'min': 1})
