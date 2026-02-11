'use client'

import { useState } from 'react'
import {
  Stethoscope, Calendar, Clock, User, Phone, Mail, Video,
  MapPin, Star, ChevronRight, Heart, Brain, Eye, Bone,
  Baby, Activity, Menu, X, Shield, CheckCircle
} from 'lucide-react'
import { cn, formatDate, type Doctor, type TimeSlot } from '@/lib/utils'

const specialties = [
  { name: 'Médecine générale', icon: Stethoscope, color: 'bg-blue-100 text-blue-600' },
  { name: 'Cardiologie', icon: Heart, color: 'bg-red-100 text-red-600' },
  { name: 'Neurologie', icon: Brain, color: 'bg-purple-100 text-purple-600' },
  { name: 'Ophtalmologie', icon: Eye, color: 'bg-green-100 text-green-600' },
  { name: 'Orthopédie', icon: Bone, color: 'bg-orange-100 text-orange-600' },
  { name: 'Pédiatrie', icon: Baby, color: 'bg-pink-100 text-pink-600' },
]

const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Marie Dupont',
    specialty: 'Médecine générale',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
    available: true,
    nextSlot: new Date(Date.now() + 3600000),
  },
  {
    id: '2',
    name: 'Dr. Pierre Martin',
    specialty: 'Cardiologie',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
    available: true,
    nextSlot: new Date(Date.now() + 7200000),
  },
  {
    id: '3',
    name: 'Dr. Sophie Bernard',
    specialty: 'Pédiatrie',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200',
    available: false,
  },
  {
    id: '4',
    name: 'Dr. Jean Petit',
    specialty: 'Neurologie',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200',
    available: true,
    nextSlot: new Date(Date.now() + 86400000),
  },
]

const timeSlots: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '09:30', available: false },
  { time: '10:00', available: true },
  { time: '10:30', available: true },
  { time: '11:00', available: false },
  { time: '11:30', available: true },
  { time: '14:00', available: true },
  { time: '14:30', available: true },
  { time: '15:00', available: false },
  { time: '15:30', available: true },
  { time: '16:00', available: true },
  { time: '16:30', available: false },
]

export default function Medical() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [appointmentType, setAppointmentType] = useState<'consultation' | 'teleconsultation'>('consultation')

  const handleBooking = () => {
    if (selectedDoctor && selectedTime) {
      alert(`Rendez-vous confirmé avec ${selectedDoctor.name} le ${formatDate(selectedDate)} à ${selectedTime}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-600 rounded-xl">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">MediCare</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#specialites" className="text-gray-600 dark:text-gray-300 hover:text-cyan-600">Spécialités</a>
              <a href="#medecins" className="text-gray-600 dark:text-gray-300 hover:text-cyan-600">Nos médecins</a>
              <a href="#rdv" className="text-gray-600 dark:text-gray-300 hover:text-cyan-600">Prendre RDV</a>
              <a href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-cyan-600">Contact</a>
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
                Espace patient
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-700 dark:text-cyan-300 text-sm mb-6">
              <Shield className="w-4 h-4" />
              Praticiens certifiés
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Votre santé, notre priorité
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Prenez rendez-vous avec nos spécialistes en quelques clics. Consultation sur place ou en téléconsultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#rdv"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Prendre rendez-vous
              </a>
              <a
                href="#medecins"
                className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-cyan-600 text-cyan-600 font-semibold rounded-xl hover:bg-cyan-50 transition-colors"
              >
                Voir nos médecins
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600"
              alt="Médecin"
              className="rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">+500 patients</p>
                  <p className="text-sm text-gray-500">satisfaits ce mois</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section id="specialites" className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Nos spécialités</h2>
            <p className="text-gray-600 dark:text-gray-400">Une équipe pluridisciplinaire à votre service</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specialties.map((specialty) => (
              <div
                key={specialty.name}
                className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className={cn('p-4 rounded-2xl mb-4', specialty.color)}>
                  <specialty.icon className="w-8 h-8" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white text-center text-sm">
                  {specialty.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section id="medecins" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Notre équipe médicale</h2>
            <p className="text-gray-600 dark:text-gray-400">Des praticiens expérimentés et à l'écoute</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                  {doctor.available && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      Disponible
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{doctor.name}</h3>
                  <p className="text-cyan-600 text-sm mb-4">{doctor.specialty}</p>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">5.0</span>
                  </div>
                  {doctor.available && doctor.nextSlot && (
                    <p className="text-sm text-gray-500 mb-4">
                      <Clock className="inline w-4 h-4 mr-1" />
                      Prochain RDV: {doctor.nextSlot.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    disabled={!doctor.available}
                    className={cn(
                      'w-full py-3 rounded-xl font-medium transition-colors',
                      doctor.available
                        ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    {doctor.available ? 'Prendre RDV' : 'Indisponible'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="rdv" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Prendre rendez-vous</h2>
            <p className="text-gray-600 dark:text-gray-400">Choisissez votre créneau en quelques clics</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            {/* Appointment type */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setAppointmentType('consultation')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-medium transition-colors',
                  appointmentType === 'consultation'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                )}
              >
                <User className="w-5 h-5" />
                Consultation
              </button>
              <button
                onClick={() => setAppointmentType('teleconsultation')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-medium transition-colors',
                  appointmentType === 'teleconsultation'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                )}
              >
                <Video className="w-5 h-5" />
                Téléconsultation
              </button>
            </div>

            {/* Time slots */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Créneaux disponibles</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={cn(
                      'py-3 rounded-lg font-medium transition-colors',
                      !slot.available && 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed',
                      slot.available && selectedTime !== slot.time && 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100',
                      selectedTime === slot.time && 'bg-cyan-600 text-white'
                    )}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={!selectedTime}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
            >
              Confirmer le rendez-vous
            </button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Téléphone</h3>
            <p className="text-gray-600 dark:text-gray-400">01 23 45 67 89</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
            <p className="text-gray-600 dark:text-gray-400">contact@medicare.fr</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Adresse</h3>
            <p className="text-gray-600 dark:text-gray-400">25 Avenue de la Santé, Paris</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="p-2 bg-cyan-600 rounded-xl">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">MediCare</span>
          </div>
          <p className="text-gray-400 mb-6">
            Centre médical pluridisciplinaire au service de votre santé
          </p>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} MediCare. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
