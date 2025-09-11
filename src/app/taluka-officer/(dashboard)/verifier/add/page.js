"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, FileText, User, Navigation, Lock, Plus, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useVerifierStore } from '@/stores/verifierStore';


const stateMaharashtra = 'Maharashtra';
const maharashtraDistricts = {
  'Ahmednagar': [
    'Ahmednagar',
    'Shrirampur',
    'Rahata',
    'Rahuri',
    'Sangamner',
    'Kopargaon',
    'Akole',
    'Nevasa',
    'Shevgaon',
    'Pathardi',
    'Parner',
    'Jamkhed',
    'Karjat',
  ],
  'Akola': ['Akola', 'Balapur', 'Patur', 'Telhara', 'Akot', 'Murtijapur'],
  'Amravati': [
    'Amravati',
    'Chandur Railway',
    'Chikhaldara',
    'Daryapur',
    'Dhamangaon Railway',
    'Morshi',
    'Nandgaon-Khandeshwar',
    'Anjangaon Surji',
    'Achalpur',
  ],
  'Aurangabad': [
    'Aurangabad',
    'Gangapur',
    'Vaijapur',
    'Sillod',
    'Kannad',
    'Paithan',
    'Khuldabad',
    'Phulambri',
  ],
  'Beed': [
    'Beed',
    'Ashti',
    'Ambejogai',
    'Patoda',
    'Kaij',
    'Georai',
    'Majalgaon',
    'Parli',
    'Shirur (Beed)',
  ],
  'Bhandara': ['Bhandara', 'Tumsar', 'Sakoli', 'Lakhani', 'Mohadi', 'Pauni'],
  'Buldhana': [
    'Buldhana',
    'Chikhli',
    'Mehkar',
    'Jalgaon Jamod',
    'Sangrampur',
    'Malkapur',
    'Deulgaon Raja',
    'Motala',
    'Nandura',
    'Shegaon',
  ],
  'Chandrapur': [
    'Chandrapur',
    'Warora',
    'Bhadravati',
    'Chimur',
    'Nagbhid',
    'Mul',
    'Saoli',
    'Rajura',
    'Pombhurna',
    'Ballarpur',
    'Gondpipri',
    'Korpana',
  ],
  'Dhule': ['Dhule', 'Shirpur', 'Sakri', 'Sindkheda'],
  'Gadchiroli': [
    'Gadchiroli',
    'Aheri',
    'Chamorshi',
    'Etapalli',
    'Armori',
    'Desaiganj (Wadsa)',
    'Korchi',
    'Kurkheda',
    'Mulchera',
  ],
  'Gondia': [
    'Gondia',
    'Tirora',
    'Goregaon',
    'Amgaon',
    'Arjuni Morgaon',
    'Deori',
    'Sadak Arjuni',
    'Salekasa',
  ],
  'Hingoli': ['Hingoli', 'Kalamnuri', 'Basmath', 'Sengaon'],
  'Jalgaon': [
    'Jalgaon',
    'Bhusawal',
    'Jamner',
    'Chalisgaon',
    'Erandol',
    'Yawal',
    'Amalner',
    'Pachora',
    'Parola',
    'Dharangaon',
  ],
  'Jalna': [
    'Jalna',
    'Bhokardan',
    'Jaffrabad',
    'Ambad',
    'Badnapur',
    'Mantha',
    'Partur',
    'Ghansawangi',
  ],
  'Kolhapur': [
    'Kolhapur',
    'Karveer',
    'Gaganbawada',
    'Radhanagari',
    'Ajra',
    'Bhudargad',
    'Chandgad',
    'Gadhinglaj',
    'Hatkanangale',
    'Kagal',
    'Panhala',
    'Shirol',
  ],
  'Latur': [
    'Latur',
    'Ahmadpur',
    'Udgir',
    'Nilanga',
    'Ausa',
    'Chakur',
    'Deoni',
    'Renapur',
    'Shirur Anantpal',
  ],
  'Mumbai City': ['Mumbai City'],
  'Mumbai Suburban': ['Mumbai Suburban'],
  'Nagpur': [
    'Nagpur',
    'Katol',
    'Narkhed',
    'Kalmeshwar',
    'Hingna',
    'Umred',
    'Parseoni',
    'Ramtek',
    'Bhiwapur',
    'Kuhi',
    'Mauda',
  ],
  'Nanded': [
    'Nanded',
    'Kinwat',
    'Hadgaon',
    'Bhokar',
    'Loha',
    'Naigaon',
    'Mukhed',
    'Deglur',
    'Kandhar',
    'Himayatnagar',
  ],
  'Nandurbar': [
    'Nandurbar',
    'Shahada',
    'Taloda',
    'Navapur',
    'Akkalkuwa',
    'Akrani (Dhadgaon)',
  ],
  'Nashik': [
    'Nashik',
    'Malegaon',
    'Sinnar',
    'Igatpuri',
    'Kalwan',
    'Dindori',
    'Chandwad',
    'Deola',
    'Niphad',
    'Peth',
    'Trimbakeshwar',
    'Baglan',
    'Yevla',
  ],
  'Osmanabad': [
    'Osmanabad',
    'Tuljapur',
    'Paranda',
    'Bhum',
    'Kalamb',
    'Lohara',
    'Umarga',
    'Vashi',
  ],
  'Parbhani': [
    'Parbhani',
    'Gangakhed',
    'Pathri',
    'Sonpeth',
    'Manwat',
    'Jintur',
    'Purna',
    'Palam',
    'Sailu',
  ],
  'Pune': [
    'Pune City',
    'Haveli',
    'Mulshi',
    'Bhor',
    'Baramati',
    'Indapur',
    'Junnar',
    'Daund',
    'Ambegaon',
    'Shirur',
    'Velhe',
    'Purandar',
    'Mawal',
    'Khed',
  ],
  'Raigad': [
    'Alibag',
    'Pen',
    'Mahad',
    'Murud',
    'Roha',
    'Shrivardhan',
    'Tala',
    'Uran',
    'Karjat',
    'Khalapur',
    'Mangaon',
    'Poladpur',
    'Sudhagad Pali',
  ],
  'Ratnagiri': [
    'Ratnagiri',
    'Mandangad',
    'Dapoli',
    'Khed',
    'Guhagar',
    'Chiplun',
    'Sangameshwar',
    'Lanja',
    'Rajapur',
  ],
  'Sangli': [
    'Sangli',
    'Miraj',
    'Tasgaon',
    'Kavathemahankal',
    'Jath',
    'Khanapur',
    'Palus',
    'Atpadi',
    'Walwa',
    'Shirala',
  ],
  'Satara': [
    'Satara',
    'Karad',
    'Wai',
    'Patan',
    'Mahabaleshwar',
    'Phaltan',
    'Khatav',
    'Koregaon',
    'Jaoli',
    'Man',
  ],
  'Sindhudurg': [
    'Sindhudurg',
    'Kudal',
    'Sawantwadi',
    'Dodamarg',
    'Vengurla',
    'Malvan',
    'Devgad',
    'Kankavli',
  ],
  'Solapur': [
    'Solapur North',
    'Solapur South',
    'Barshi',
    'Madha',
    'Karmala',
    'Mohol',
    'Pandharpur',
    'Sangole',
    'Akkalkot',
    'Malshiras',
  ],
  'Thane': [
    'Thane',
    'Kalyan',
    'Bhiwandi',
    'Murbad',
    'Ulhasnagar',
    'Ambarnath',
    'Shahapur',
  ],
  'Wardha': ['Wardha', 'Hinganghat', 'Deoli', 'Arvi', 'Seloo', 'Samudrapur'],
  'Washim': [
    'Washim',
    'Mangrulpir',
    'Karanja',
    'Manora',
    'Malegaon (Washim)',
    'Risod',
  ],
  'Yavatmal': [
    'Yavatmal',
    'Pusad',
    'Umarkhed',
    'Digras',
    'Arni',
    'Darwha',
    'Kelapur',
    'Ghatanji',
    'Ner',
    'Mahagaon',
    'Ralegaon',
    'Babulgaon',
  ],
};

const cityToDistrict = {}
for (const [district, locations] of Object.entries(maharashtraDistricts)) {
  for (const loc of locations) {
    cityToDistrict[loc.toLowerCase()] = district
  }
}

const AddVerifierPage = () => {
  const { addVerifier } = useVerifierStore(); // Add this line
  // Add the verifier store
  const { verifiers,
    loading,
    error,
    fetchAllVerifiers,
    updateVerifier,
    shouldRefresh } = useVerifierStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    aadhaarNumber: "",
    age: "",
    village: "",
    landMark: "",
    taluka: "", // Changed from [] to ""
    district: "",
    state: stateMaharashtra,
    pincode: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const router = useRouter()
  const [suggestions, setSuggestions] = useState([])
  const [districtSuggestions, setDistrictSuggestions] = useState([])
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false)

  // New states for Allocate Talukas
  const [allocatedTalukas, setAllocatedTalukas] = useState([])
  const [currentAllocatedTaluka, setCurrentAllocatedTaluka] = useState("")
  const [allocatedTalukaSuggestions, setAllocatedTalukaSuggestions] = useState([])
  const [showAllocatedTalukaDropdown, setShowAllocatedTalukaDropdown] = useState(false)

  const isDistrictFilled = !!formData.district
  const isTalukaFilled = !!formData.taluka // Changed from formData.taluka && formData.taluka.length > 0

  const districtDropdownRef = useRef(null)
  const allocatedTalukaDropdownRef = useRef(null)

  const districts = Object.keys(maharashtraDistricts)
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

  const [talukaSuggestions, setTalukaSuggestions] = useState([])
  const [showTalukaDropdown, setShowTalukaDropdown] = useState(false)
  const talukaDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close village suggestions
      setSuggestions([])

      // Close district dropdown if click is outside
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target)) {
        setShowDistrictDropdown(false)
      }

      // Close allocated taluka dropdown if click is outside
      if (allocatedTalukaDropdownRef.current && !allocatedTalukaDropdownRef.current.contains(event.target)) {
        setShowAllocatedTalukaDropdown(false)
      }

      // Close taluka dropdown if click is outside
      if (talukaDropdownRef.current && !talukaDropdownRef.current.contains(event.target)) {
        setShowTalukaDropdown(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Auto-complete logic for village/district/state
    if (name === "village") {
      const villageLower = value.toLowerCase()
      // Find matching villages
      const matches = []
      for (const [district, locations] of Object.entries(maharashtraDistricts)) {
        for (const loc of locations) {
          if (loc.toLowerCase().includes(villageLower)) {
            matches.push(loc)
            if (matches.length >= 5) break // Limit suggestions
          }
        }
      }
      setSuggestions(matches)

      // Auto-fill district and state if village matches exactly
      if (cityToDistrict[villageLower]) {
        setFormData((prev) => ({
          ...prev,
          district: cityToDistrict[villageLower],
          state: stateMaharashtra,
        }))
      }
    }
  }

  const handleDistrictInput = (e) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      district: value,
      taluka: "", // Changed from [] to ""
    }))

    // Filter district suggestions by value
    if (value.trim() === "") {
      setDistrictSuggestions(districts)
    } else {
      setDistrictSuggestions(districts.filter((d) => d.toLowerCase().includes(value.trim().toLowerCase())))
    }
    setShowDistrictDropdown(true)

    // Clear allocated talukas when district changes
    setAllocatedTalukas([])
    setCurrentAllocatedTaluka("")
    setAllocatedTalukaSuggestions([])
  }

  const handleDistrictSelect = (district) => {
    setFormData((prev) => ({
      ...prev,
      district,
      taluka: "", // Clear taluka when district changed
    }))
    setDistrictSuggestions([])
    setShowDistrictDropdown(false)

    // Set taluka options for selected district
    setTalukaSuggestions(maharashtraDistricts[district] || [])

    // Update allocated taluka suggestions when district changes
    setAllocatedTalukaSuggestions(maharashtraDistricts[district] || [])
    setAllocatedTalukas([]) // Clear previously allocated talukas
    setCurrentAllocatedTaluka("")
  }

  const handleTalukaInput = (e) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      taluka: value,
    }))

    if (formData.district && maharashtraDistricts[formData.district]) {
      if (value.trim() === "") {
        setTalukaSuggestions(maharashtraDistricts[formData.district])
      } else {
        setTalukaSuggestions(
          maharashtraDistricts[formData.district].filter((t) => t.toLowerCase().includes(value.trim().toLowerCase())),
        )
      }
      setShowTalukaDropdown(true)
    }
  }

  const handleTalukaSelect = (taluka) => {
    setFormData((prev) => ({
      ...prev,
      taluka: taluka,
    }))
    setTalukaSuggestions([])
    setShowTalukaDropdown(false)
  }

  // New functions for Allocate Talukas
  const handleAllocatedTalukaInput = (e) => {
    const { value } = e.target
    setCurrentAllocatedTaluka(value)

    if (formData.district && maharashtraDistricts[formData.district]) {
      if (value.trim() === "") {
        setAllocatedTalukaSuggestions(maharashtraDistricts[formData.district])
      } else {
        setAllocatedTalukaSuggestions(
          maharashtraDistricts[formData.district].filter(
            (t) => t.toLowerCase().includes(value.trim().toLowerCase()) && !allocatedTalukas.includes(t), // Exclude already allocated talukas
          ),
        )
      }
      setShowAllocatedTalukaDropdown(true)
    }
  }

  const handleAllocatedTalukaSelect = (taluka) => {
    setCurrentAllocatedTaluka(taluka)
    setShowAllocatedTalukaDropdown(false)
  }

  const handleAddAllocatedTaluka = () => {
    if (currentAllocatedTaluka && !allocatedTalukas.includes(currentAllocatedTaluka)) {
      setAllocatedTalukas((prev) => [...prev, currentAllocatedTaluka])
      setCurrentAllocatedTaluka("")

      // Update suggestions to exclude the newly added taluka
      if (formData.district && maharashtraDistricts[formData.district]) {
        setAllocatedTalukaSuggestions(
          maharashtraDistricts[formData.district].filter(
            (t) => !allocatedTalukas.includes(t) && t !== currentAllocatedTaluka,
          ),
        )
      }
    }
  }

  const handleRemoveAllocatedTaluka = (talukaToRemove) => {
    setAllocatedTalukas((prev) => prev.filter((t) => t !== talukaToRemove))

    // Update suggestions to include the removed taluka
    if (formData.district && maharashtraDistricts[formData.district]) {
      setAllocatedTalukaSuggestions(
        maharashtraDistricts[formData.district].filter((t) => !allocatedTalukas.includes(t) || t === talukaToRemove),
      )
    }
  }

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      village: suggestion,
      district: cityToDistrict[suggestion.toLowerCase()] || "",
      state: cityToDistrict[suggestion.toLowerCase()] ? stateMaharashtra : "",
    }))
    setSuggestions([])
  }

  const validateForm = () => {
    const newErrors = {}

    // Required field validation
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.contact.trim()) newErrors.contact = "Contact is required"
    if (!formData.aadhaarNumber.trim()) newErrors.aadhaarNumber = "Aadhaar number is required"
    if (!formData.age) newErrors.age = "Age is required"
    if (!formData.village.trim()) newErrors.village = "Village is required"
    if (!formData.taluka.trim()) {
      newErrors.taluka = "Taluka is required"
    }
    if (!allocatedTalukas || allocatedTalukas.length === 0) {
      newErrors.allocatedTaluka = "At least one taluka is to be allocated"
    }
    if (!formData.district.trim()) newErrors.district = "District is required"
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required"

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    if (formData.contact && !/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = "Please enter a valid 10-digit phone number"
    }

    // Aadhaar validation
    if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = "Please enter a valid 12-digit Aadhaar number"
    }

    // Age validation
    if (formData.age && (isNaN(formData.age) || formData.age < 18 || formData.age > 100)) {
      newErrors.age = "Please enter a valid age (18-100)"
    }

    // Pincode validation
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Submitting form...", formData)

    if (!validateForm()) {
      console.log("Validation failed", errors)
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("Authorization")?.split(" ")[1]
      if (!token) {
        toast.error("Authentication token not found, redirecting to login")
        setTimeout(async () => {
          await router.push("/login")
        }, 3000)
        return
      }

      const { ...submitData } = formData
      const transformedData = {
        ...submitData,
        state: submitData.state.toLowerCase(),
        district: submitData.district.toLowerCase(),
        taluka: submitData.taluka.toLowerCase(),
        village: submitData.village.toLowerCase(),
        allocatedTaluka: allocatedTalukas.map((t) => t.toLowerCase()),
      }

      const response = await axios.post(`${BASE_URL}/api/verifier/register`, transformedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.status === 201) {
        const newVerifier = response.data.data; // Assuming your API returns the created verifier

        // Add the new verifier to the store
        // addVerifier(newVerifier);

        // Background refresh: refetch all verifiers so store stays in sync
         try {
          const token = localStorage.getItem("Authorization")?.split(" ")[1];
          if (token) {
             // fire-and-forget (don't block UI)
             fetchAllVerifiers(token, BASE_URL);
          }
        } catch (err) {
          console.error("Background refresh failed:", err);
        }
        

        toast.success("Verifier registered successfully!", {
          duration: 4000,
          position: "top-center",
        })
        setSubmitSuccess(true)
        setFormData({
          name: "",
          email: "",
          contact: "",
          aadhaarNumber: "",
          age: "",
          village: "",
          landMark: "",
          taluka: "",
          district: "",
          state: "Maharashtra",
          pincode: "",
        })
        setAllocatedTalukas([])
        setCurrentAllocatedTaluka("")

        // Redirect to verifiers list after successful submission
        setTimeout(() => {
          router.push("/taluka-officer/verifier/all"); // Adjust this path to your verifiers list page
        }, 2000);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Authentication Failed, redirecting to login page")
        localStorage.removeItem("Authorization")
        setTimeout(() => {
          router.push("/login")
        }, 3000)
        return
      }
      if (err.response?.status === 500) {
        const errorMessage = err.response?.data?.message || ""
        if (errorMessage.includes("contact_1")) {
          setErrors((prev) => ({
            ...prev,
            contact: "This phone number is already registered",
          }))
          toast.error("This phone number is already registered")
        } else if (errorMessage.includes("aadhaarNumber_1")) {
          setErrors((prev) => ({
            ...prev,
            aadhaarNumber: "This Aadhaar number is already registered",
          }))
          toast.error("This Aadhaar number is already registered")
        } else {
          toast.error("An error occurred while registering the verifier")
        }
      } else {
        toast.error("An unexpected error occurred")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifier Added Successfully!</h2>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="mt-6 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            Add Another Verifier
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Verifier</h1>
          <p className="text-gray-600 mt-2">Fill in the details to register a new verifier</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 sm:p-8">
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verifier Registration</h2>
            </div>
          </div>

          <div className="space-y-10">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="100"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.age ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Enter age"
                  />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                  <input
                    type="tel"
                    name="contact"
                    maxLength={10}
                    value={formData.contact}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.contact ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Enter 10-digit phone number"
                  />
                  {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number *</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    maxLength={12}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.aadhaarNumber ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Enter 12-digit Aadhaar number"
                  />
                  {errors.aadhaarNumber && <p className="text-red-500 text-sm mt-1">{errors.aadhaarNumber}</p>}
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Address Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={stateMaharashtra}
                    disabled
                    className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>

                {/* District */}
                <div className="relative" ref={districtDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleDistrictInput}
                    onFocus={() => {
                      setDistrictSuggestions(districts)
                      setShowDistrictDropdown(true)
                    }}
                    autoComplete="off"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.district ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Select or type district"
                  />
                  {showDistrictDropdown && districtSuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {districtSuggestions.map((district) => (
                        <li
                          key={district}
                          className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDistrictSelect(district)
                          }}
                        >
                          {district}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                </div>

                {/* Taluka */}
                <div className="relative" ref={talukaDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taluka *</label>
                  <input
                    type="text"
                    name="taluka"
                    value={formData.taluka}
                    onChange={handleTalukaInput}
                    onFocus={() => {
                      if (formData.district && maharashtraDistricts[formData.district]) {
                        setTalukaSuggestions(maharashtraDistricts[formData.district])
                        setShowTalukaDropdown(true)
                      }
                    }}
                    autoComplete="off"
                    disabled={!isDistrictFilled}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.taluka ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder={!formData.district ? "Select district first" : "Select or type taluka"}
                  />
                  {showTalukaDropdown && talukaSuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {talukaSuggestions.map((taluka) => (
                        <li
                          key={taluka}
                          className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTalukaSelect(taluka)
                          }}
                        >
                          {taluka}
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.taluka && <p className="text-red-500 text-sm mt-1">{errors.taluka}</p>}
                </div>

                {/* Village */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village *</label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.village ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Enter village name"
                    autoComplete="off"
                    disabled={!isTalukaFilled}
                  />
                  {errors.village && <p className="text-red-500 text-sm mt-1">{errors.village}</p>}
                </div>

                {/* Landmark */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    name="landMark"
                    value={formData.landMark}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter nearby landmark"
                    disabled={!isTalukaFilled}
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.pincode ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Enter pincode"
                    disabled={!isTalukaFilled}
                  />
                  {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </div>

            {/* Allocate Talukas Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Allocate Talukas
              </h3>
              {/* Input field with Add button */}
              <div className="mb-4">
                <div className="flex gap-3">
                  <div className="flex-1 relative" ref={allocatedTalukaDropdownRef}>
                    <input
                      type="text"
                      value={currentAllocatedTaluka}
                      onChange={handleAllocatedTalukaInput}
                      onFocus={() => {
                        if (formData.district && maharashtraDistricts[formData.district]) {
                          setAllocatedTalukaSuggestions(
                            maharashtraDistricts[formData.district].filter((t) => !allocatedTalukas.includes(t)),
                          )
                          setShowAllocatedTalukaDropdown(true)
                        }
                      }}
                      autoComplete="off"
                      disabled={!isDistrictFilled}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={
                        !formData.district ? "Select district first" : "Search and select taluka to allocate"
                      }
                    />
                    {showAllocatedTalukaDropdown && allocatedTalukaSuggestions.length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {allocatedTalukaSuggestions.map((taluka) => (
                          <li
                            key={taluka}
                            className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAllocatedTalukaSelect(taluka)
                            }}
                          >
                            {taluka}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAllocatedTaluka}
                    disabled={!currentAllocatedTaluka || !isDistrictFilled}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {errors.allocatedTaluka && <p className="text-red-500 text-sm mt-1">{errors.allocatedTaluka}</p>}
              </div>

              {/* Display allocated talukas */}
              {allocatedTalukas.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Allocated Talukas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {allocatedTalukas.map((taluka, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {taluka}
                        <button
                          type="button"
                          onClick={() => handleRemoveAllocatedTaluka(taluka)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          −
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-12 pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding Verifier...</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span>Add Verifier</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddVerifierPage
