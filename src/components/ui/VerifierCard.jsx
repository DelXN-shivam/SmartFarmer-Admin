"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Phone, FileText, User, Eye, X, Edit, Save, XCircle, Map } from "lucide-react"

// Replicate the district data here for the overlay's internal logic
const stateMaharashtra = "Maharashtra"
const maharashtraDistricts = {
  Ahmednagar: [
    "Ahmednagar",
    "Shrirampur",
    "Rahata",
    "Rahuri",
    "Sangamner",
    "Kopargaon",
    "Akole",
    "Nevasa",
    "Shevgaon",
    "Pathardi",
    "Parner",
    "Jamkhed",
    "Karjat",
  ],
  Akola: ["Akola", "Balapur", "Patur", "Telhara", "Akot", "Murtijapur"],
  Amravati: [
    "Amravati",
    "Chandur Railway",
    "Chikhaldara",
    "Daryapur",
    "Dhamangaon Railway",
    "Morshi",
    "Nandgaon-Khandeshwar",
    "Anjangaon Surji",
    "Achalpur",
  ],
  Aurangabad: ["Aurangabad", "Gangapur", "Vaijapur", "Sillod", "Kannad", "Paithan", "Khuldabad", "Phulambri"],
  Beed: ["Beed", "Ashti", "Ambejogai", "Patoda", "Kaij", "Georai", "Majalgaon", "Parli", "Shirur (Beed)"],
  Bhandara: ["Bhandara", "Tumsar", "Sakoli", "Lakhani", "Mohadi", "Pauni"],
  Buldhana: [
    "Buldhana",
    "Chikhli",
    "Mehkar",
    "Jalgaon Jamod",
    "Sangrampur",
    "Malkapur",
    "Deulgaon Raja",
    "Motala",
    "Nandura",
    "Shegaon",
  ],
  Chandrapur: [
    "Chandrapur",
    "Warora",
    "Bhadravati",
    "Chimur",
    "Nagbhid",
    "Mul",
    "Saoli",
    "Rajura",
    "Pombhurna",
    "Ballarpur",
    "Gondpipri",
    "Korpana",
  ],
  Dhule: ["Dhule", "Shirpur", "Sakri", "Sindkheda"],
  Gadchiroli: [
    "Gadchiroli",
    "Aheri",
    "Chamorshi",
    "Etapalli",
    "Armori",
    "Desaiganj (Wadsa)",
    "Korchi",
    "Kurkheda",
    "Mulchera",
  ],
  Gondia: ["Gondia", "Tirora", "Goregaon", "Amgaon", "Arjuni Morgaon", "Deori", "Sadak Arjuni", "Salekasa"],
  Hingoli: ["Hingoli", "Kalamnuri", "Basmath", "Sengaon"],
  Jalgaon: [
    "Jalgaon",
    "Bhusawal",
    "Jamner",
    "Chalisgaon",
    "Erandol",
    "Yawal",
    "Amalner",
    "Pachora",
    "Parola",
    "Dharangaon",
  ],
  Jalna: ["Jalna", "Bhokardan", "Jaffrabad", "Ambad", "Badnapur", "Mantha", "Partur", "Ghansawangi"],
  Kolhapur: [
    "Kolhapur",
    "Karveer",
    "Gaganbawada",
    "Radhanagari",
    "Ajra",
    "Bhudargad",
    "Chandgad",
    "Gadhinglaj",
    "Hatkanangale",
    "Kagal",
    "Panhala",
    "Shirol",
  ],
  Latur: ["Latur", "Ahmadpur", "Udgir", "Nilanga", "Ausa", "Chakur", "Deoni", "Renapur", "Shirur Anantpal"],
  "Mumbai City": ["Mumbai City"],
  "Mumbai Suburban": ["Mumbai Suburban"],
  Nagpur: [
    "Nagpur",
    "Katol",
    "Narkhed",
    "Kalmeshwar",
    "Hingna",
    "Umred",
    "Parseoni",
    "Ramtek",
    "Bhiwapur",
    "Kuhi",
    "Mauda",
  ],
  Nanded: ["Nanded", "Kinwat", "Hadgaon", "Bhokar", "Loha", "Naigaon", "Mukhed", "Deglur", "Kandhar", "Himayatnagar"],
  Nandurbar: ["Nandurbar", "Shahada", "Taloda", "Navapur", "Akkalkuwa", "Akrani (Dhadgaon)"],
  Nashik: [
    "Nashik",
    "Malegaon",
    "Sinnar",
    "Igatpuri",
    "Kalwan",
    "Dindori",
    "Chandwad",
    "Deola",
    "Niphad",
    "Peth",
    "Trimbakeshwar",
    "Baglan",
    "Yevla",
  ],
  Osmanabad: ["Osmanabad", "Tuljapur", "Paranda", "Bhum", "Kalamb", "Lohara", "Umarga", "Vashi"],
  Parbhani: ["Parbhani", "Gangakhed", "Pathri", "Sonpeth", "Manwat", "Jintur", "Purna", "Palam", "Sailu"],
  Pune: [
    "Pune City",
    "Haveli",
    "Mulshi",
    "Bhor",
    "Baramati",
    "Indapur",
    "Junnar",
    "Daund",
    "Ambegaon",
    "Shirur",
    "Velhe",
    "Purandar",
    "Mawal",
    "Khed",
  ],
  Raigad: [
    "Alibag",
    "Pen",
    "Mahad",
    "Murud",
    "Roha",
    "Shrivardhan",
    "Tala",
    "Uran",
    "Karjat",
    "Khalapur",
    "Mangaon",
    "Poladpur",
    "Sudhagad Pali",
  ],
  Ratnagiri: ["Ratnagiri", "Mandangad", "Dapoli", "Khed", "Guhagar", "Chiplun", "Sangameshwar", "Lanja", "Rajapur"],
  Sangli: ["Sangli", "Miraj", "Tasgaon", "Kavathemahankal", "Jath", "Khanapur", "Palus", "Atpadi", "Walwa", "Shirala"],
  Satara: ["Satara", "Karad", "Wai", "Patan", "Mahabaleshwar", "Phaltan", "Khatav", "Koregaon", "Jaoli", "Man"],
  Sindhudurg: ["Sindhudurg", "Kudal", "Sawantwadi", "Dodamarg", "Vengurla", "Malvan", "Devgad", "Kankavli"],
  Solapur: [
    "Solapur North",
    "Solapur South",
    "Barshi",
    "Madha",
    "Karmala",
    "Mohol",
    "Pandharpur",
    "Sangole",
    "Akkalkot",
    "Malshiras",
  ],
  Thane: ["Thane", "Kalyan", "Bhiwandi", "Murbad", "Ulhasnagar", "Ambarnath", "Shahapur"],
  Wardha: ["Wardha", "Hinganghat", "Deoli", "Arvi", "Seloo", "Samudrapur"],
  Washim: ["Washim", "Mangrulpir", "Karanja", "Manora", "Malegaon (Washim)", "Risod"],
  Yavatmal: [
    "Yavatmal",
    "Pusad",
    "Umarkhed",
    "Digras",
    "Arni",
    "Darwha",
    "Kelapur",
    "Ghatanji",
    "Ner",
    "Mahagaon",
    "Ralegaon",
    "Babulgaon",
  ],
}

const VerifierCard = ({
  verifiers,
  onVerify,
  onEdit,
  isTalukasAllocated,
  category,
}) => {
  const [selectedVerifier, setSelectedVerifier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTableView, setIsTableView] = useState(true);
  const [filters, setFilters] = useState({
    name: "",
    village: "",
    taluka: "",
    district: "",
    pincode: "",
    contact: "",
    status: "",
  });

  const maskAadhaar = (aadhaar) =>
    aadhaar?.replace(/(\d{4})(\d{4})(\d{4})/, "****-****-$3") || "Not provided";
  const formatDocumentName = (doc) =>
    doc
      .replace(/[_-]/g, " ")
      .replace(/\.(jpg|pdf|png)$/i, "")
      .toUpperCase();

  const openVerifierDetails = (verifier) => setSelectedVerifier(verifier);
  const closeVerifierDetails = () => setSelectedVerifier(null);

  const includesIgnoreCase = (value, query) => {
    if (!query) return true;
    if (value === undefined || value === null) return false;
    return String(value).toLowerCase().includes(String(query).toLowerCase());
  };

  const filteredVerifiers = useMemo(() => {
    const list = Array.isArray(verifiers) ? verifiers : [];
    return list.filter((v) => (
      includesIgnoreCase(v?.name, filters.name) &&
      includesIgnoreCase(v?.village, filters.village) &&
      includesIgnoreCase(v?.taluka, filters.taluka) &&
      includesIgnoreCase(v?.district, filters.district) &&
      includesIgnoreCase(v?.pincode, filters.pincode) &&
      includesIgnoreCase(v?.contact, filters.contact) &&
      includesIgnoreCase(v?.applicationStatus, filters.status)
    ));
  }, [verifiers, filters]);

  const VerifierDetailOverlay = ({ verifier, onClose, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableVerifier, setEditableVerifier] = useState(() => ({
      ...verifier,
      location: verifier.location ? { ...verifier.location } : undefined,
      submittedDocuments: verifier.submittedDocuments
        ? [...verifier.submittedDocuments]
        : [],
      allocatedTaluka: verifier.allocatedTaluka
        ? [...verifier.allocatedTaluka]
        : [],
    }));

    // States for main Taluka dropdown in overlay
    const [talukaSuggestionsOverlay, setTalukaSuggestionsOverlay] = useState(
      []
    );
    const [showTalukaDropdownOverlay, setShowTalukaDropdownOverlay] =
      useState(false);
    const talukaDropdownRefOverlay = useRef(null);

    // States for Allocate Talukas in overlay
    const [currentAllocatedTaluka, setCurrentAllocatedTaluka] = useState("");
    const [allocatedTalukaSuggestions, setAllocatedTalukaSuggestions] =
      useState([]);
    const [showAllocatedTalukaDropdown, setShowAllocatedTalukaDropdown] =
      useState(false);
    const allocatedTalukaDropdownRef = useRef(null);

    // Determine if district is filled for enabling taluka inputs
    const isDistrictFilled = !!editableVerifier.district;

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          allocatedTalukaDropdownRef.current &&
          !allocatedTalukaDropdownRef.current.contains(event.target)
        ) {
          setShowAllocatedTalukaDropdown(false);
        }
        if (
          talukaDropdownRefOverlay.current &&
          !talukaDropdownRefOverlay.current.contains(event.target)
        ) {
          setShowTalukaDropdownOverlay(false);
        }
      };
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setEditableVerifier((prev) => ({ ...prev, [name]: value }));
    };

    // Functions for main Taluka dropdown in overlay
    const handleTalukaInputOverlay = (e) => {
      const { value } = e.target;
      setEditableVerifier((prev) => ({
        ...prev,
        taluka: value,
      }));
      if (
        editableVerifier.district &&
        maharashtraDistricts[editableVerifier.district]
      ) {
        if (value.trim() === "") {
          setTalukaSuggestionsOverlay(
            maharashtraDistricts[editableVerifier.district]
          );
        } else {
          setTalukaSuggestionsOverlay(
            maharashtraDistricts[editableVerifier.district].filter((t) =>
              t.toLowerCase().includes(value.trim().toLowerCase())
            )
          );
        }
        setShowTalukaDropdownOverlay(true);
      }
    };

    const handleTalukaSelectOverlay = (taluka) => {
      setEditableVerifier((prev) => ({
        ...prev,
        taluka: taluka,
      }));
      setTalukaSuggestionsOverlay([]);
      setShowTalukaDropdownOverlay(false);
    };

    // Functions for Allocate Talukas in overlay
    const handleAllocatedTalukaInput = (e) => {
      const { value } = e.target;
      setCurrentAllocatedTaluka(value);
      if (
        editableVerifier.district &&
        maharashtraDistricts[editableVerifier.district]
      ) {
        if (value.trim() === "") {
          setAllocatedTalukaSuggestions(
            maharashtraDistricts[editableVerifier.district]
          );
        } else {
          setAllocatedTalukaSuggestions(
            maharashtraDistricts[editableVerifier.district].filter(
              (t) =>
                t.toLowerCase().includes(value.trim().toLowerCase()) &&
                !editableVerifier.allocatedTaluka.includes(t)
            )
          );
        }
        setShowAllocatedTalukaDropdown(true);
      }
    };

    const handleAllocatedTalukaSelect = (taluka) => {
      setCurrentAllocatedTaluka(taluka);
      setShowAllocatedTalukaDropdown(false);
    };

    const handleAddAllocatedTaluka = () => {
      if (
        currentAllocatedTaluka &&
        !editableVerifier.allocatedTaluka.includes(currentAllocatedTaluka)
      ) {
        setEditableVerifier((prev) => ({
          ...prev,
          allocatedTaluka: [...prev.allocatedTaluka, currentAllocatedTaluka],
        }));
        setCurrentAllocatedTaluka("");
        if (
          editableVerifier.district &&
          maharashtraDistricts[editableVerifier.district]
        ) {
          setAllocatedTalukaSuggestions(
            maharashtraDistricts[editableVerifier.district].filter(
              (t) =>
                !editableVerifier.allocatedTaluka.includes(t) &&
                t !== currentAllocatedTaluka
            )
          );
        }
      }
    };

    const handleRemoveAllocatedTaluka = (talukaToRemove) => {
      setEditableVerifier((prev) => ({
        ...prev,
        allocatedTaluka: prev.allocatedTaluka.filter(
          (t) => t !== talukaToRemove
        ),
      }));
      if (
        editableVerifier.district &&
        maharashtraDistricts[editableVerifier.district]
      ) {
        setAllocatedTalukaSuggestions(
          maharashtraDistricts[editableVerifier.district].filter(
            (t) =>
              !editableVerifier.allocatedTaluka.includes(t) ||
              t === talukaToRemove
          )
        );
      }
    };

    const handleSave = () => {
      if (onEdit) {
        onEdit(editableVerifier);
      }
      setIsEditing(false);
      onClose();
    };

    const handleCancel = () => {
      setEditableVerifier(() => ({
        ...verifier,
        location: verifier.location ? { ...verifier.location } : undefined,
        submittedDocuments: verifier.submittedDocuments
          ? [...verifier.submittedDocuments]
          : [],
        allocatedTaluka: verifier.allocatedTaluka
          ? [...verifier.allocatedTaluka]
          : [],
      }));
      setIsEditing(false);
      setCurrentAllocatedTaluka("");
      setAllocatedTalukaSuggestions([]);
      setShowAllocatedTalukaDropdown(false);
      setTalukaSuggestionsOverlay([]); // Reset main taluka suggestions
      setShowTalukaDropdownOverlay(false); // Close main taluka dropdown
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{verifier.name}</h2>
                  <p className="text-white/90 text-sm">
                    Verifier • ID: {verifier._id?.slice(-8)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
                aria-label="Close details"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information Card */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Contact Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label htmlFor="contact" className="text-sm text-gray-500">
                      Phone Number
                    </Label>
                    {isEditing ? (
                      <Input
                        id="contact"
                        name="contact"
                        value={editableVerifier.contact || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-semibold text-gray-900">
                        {verifier.contact || "N/A"}
                      </p>
                    )}
                  </div>
                  {verifier.email && (
                    <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                      <Label htmlFor="email" className="text-sm text-gray-500">
                        Email Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={editableVerifier.email || ""}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">
                          {verifier.email || "N/A"}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label
                      htmlFor="aadhaarNumber"
                      className="text-sm text-gray-500"
                    >
                      Aadhaar Number
                    </Label>
                    {isEditing ? (
                      <Input
                        id="aadhaarNumber"
                        name="aadhaarNumber"
                        value={editableVerifier.aadhaarNumber || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                        maxLength={12}
                      />
                    ) : (
                      <p className="font-semibold text-gray-900">
                        {maskAadhaar(verifier.aadhaarNumber)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Address Information Card */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Address Details
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor="village"
                          className="text-sm text-gray-500"
                        >
                          Village
                        </Label>
                        {isEditing ? (
                          <Input
                            id="village"
                            name="village"
                            value={editableVerifier.village || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-semibold text-gray-900">
                            {verifier.village || "N/A"}
                          </p>
                        )}
                      </div>
                      {/* Taluka Input with Dropdown */}
                      <div className="relative" ref={talukaDropdownRefOverlay}>
                        <Label
                          htmlFor="taluka"
                          className="text-sm text-gray-500"
                        >
                          Taluka
                        </Label>
                        {isEditing ? (
                          <>
                            <Input
                              id="taluka"
                              name="taluka"
                              value={editableVerifier.taluka || ""}
                              onChange={handleTalukaInputOverlay}
                              onFocus={() => {
                                if (
                                  isDistrictFilled &&
                                  maharashtraDistricts[
                                    editableVerifier.district
                                  ]
                                ) {
                                  setTalukaSuggestionsOverlay(
                                    maharashtraDistricts[
                                      editableVerifier.district
                                    ]
                                  );
                                  setShowTalukaDropdownOverlay(true);
                                }
                              }}
                              autoComplete="off"
                              disabled={!isDistrictFilled}
                              className="mt-1"
                              placeholder={
                                !isDistrictFilled
                                  ? "Select district first"
                                  : "Select or type taluka"
                              }
                            />
                            {showTalukaDropdownOverlay &&
                              talukaSuggestionsOverlay.length > 0 && (
                                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                  {talukaSuggestionsOverlay.map((taluka) => (
                                    <li
                                      key={taluka}
                                      className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTalukaSelectOverlay(taluka);
                                      }}
                                    >
                                      {taluka}
                                    </li>
                                  ))}
                                </ul>
                              )}
                          </>
                        ) : (
                          <p className="font-semibold text-gray-900">
                            {verifier.taluka || "N/A"}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="district"
                          className="text-sm text-gray-500"
                        >
                          District
                        </Label>
                        {isEditing ? (
                          <Input
                            id="district"
                            name="district"
                            value={editableVerifier.district || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-semibold text-gray-900">
                            {verifier.district || "N/A"}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="pincode"
                          className="text-sm text-gray-500"
                        >
                          PIN Code
                        </Label>
                        {isEditing ? (
                          <Input
                            id="pincode"
                            name="pincode"
                            value={editableVerifier.pincode || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                            maxLength={6}
                          />
                        ) : (
                          <p className="font-semibold text-gray-900">
                            {verifier.pincode || "N/A"}
                          </p>
                        )}
                      </div>
                    </div>
                    {verifier.landMark && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <Label
                          htmlFor="landMark"
                          className="text-sm text-gray-500"
                        >
                          Landmark
                        </Label>
                        {isEditing ? (
                          <Input
                            id="landMark"
                            name="landMark"
                            value={editableVerifier.landMark || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-semibold text-gray-900">
                            {verifier.landMark || "N/A"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {verifier.location && (
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">GPS Coordinates</p>
                        <p className="font-semibold text-gray-900">
                          {verifier.location.latitude?.toFixed(4) || "N/A"},{" "}
                          {verifier.location.longitude?.toFixed(4) || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Documents Section */}
            {verifier.submittedDocuments &&
              verifier.submittedDocuments.length > 0 && (
                <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Submitted Documents
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {verifier.submittedDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {formatDocumentName(doc)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {/* Allocated Talukas Section - Conditionally Rendered */}
            {isTalukasAllocated && (
              <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Map className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Allocated Talukas
                  </h3>
                </div>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div
                        className="flex-1 relative"
                        ref={allocatedTalukaDropdownRef}
                      >
                        <Input
                          type="text"
                          value={currentAllocatedTaluka}
                          onChange={handleAllocatedTalukaInput}
                          onFocus={() => {
                            if (
                              isDistrictFilled &&
                              maharashtraDistricts[editableVerifier.district]
                            ) {
                              setAllocatedTalukaSuggestions(
                                maharashtraDistricts[
                                  editableVerifier.district
                                ].filter(
                                  (t) =>
                                    !editableVerifier.allocatedTaluka.includes(
                                      t
                                    )
                                )
                              );
                              setShowAllocatedTalukaDropdown(true);
                            }
                          }}
                          autoComplete="off"
                          disabled={!isDistrictFilled}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder={
                            !isDistrictFilled
                              ? "Select district first"
                              : "Search and select taluka to allocate"
                          }
                        />
                        {showAllocatedTalukaDropdown &&
                          allocatedTalukaSuggestions.length > 0 && (
                            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                              {allocatedTalukaSuggestions.map((taluka) => (
                                <li
                                  key={taluka}
                                  className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAllocatedTalukaSelect(taluka);
                                  }}
                                >
                                  {taluka}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddAllocatedTaluka}
                        disabled={!currentAllocatedTaluka || !isDistrictFilled}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </Button>
                    </div>
                    {editableVerifier.allocatedTaluka &&
                      editableVerifier.allocatedTaluka.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Current Allocated Talukas:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {editableVerifier.allocatedTaluka.map(
                              (taluka, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                >
                                  {taluka}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveAllocatedTaluka(taluka)
                                    }
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {verifier.allocatedTaluka &&
                    verifier.allocatedTaluka.length > 0 ? (
                      verifier.allocatedTaluka.map((taluka, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-indigo-100 text-indigo-800 border-indigo-300"
                        >
                          {taluka}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No talukas allocated.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Footer with Edit/Save/Cancel Buttons */}
          <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!verifiers || verifiers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No verifiers found.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">
          Showing {filteredVerifiers.length} {category}
          {filteredVerifiers.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          {/* Sort Button */}
          <Button variant="outline" onClick={() => setShowSort((v) => !v)}>
            Sort
          </Button>

          {/* Filter Button */}
          <Button variant="outline" onClick={() => setShowFilter((v) => !v)}>
            Filter
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsTableView((v) => !v)}>
            {isTableView ? "Card View" : "Table View"}
          </Button>
        </div>
      </div>

      {isTableView ? (
        <div className="w-full overflow-x-auto rounded-lg border">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Village</th>
                <th className="px-3 py-2">Taluka</th>
                <th className="px-3 py-2">District</th>
                <th className="px-3 py-2">PIN</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
              <tr className="border-t text-xs">
                <th className="px-3 py-2"><input value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.village} onChange={(e) => setFilters({ ...filters, village: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.taluka} onChange={(e) => setFilters({ ...filters, taluka: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.pincode} onChange={(e) => setFilters({ ...filters, pincode: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.contact} onChange={(e) => setFilters({ ...filters, contact: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2">
                  <Button variant="outline" className="w-full" onClick={() => setFilters({ name: "", village: "", taluka: "", district: "", pincode: "", contact: "", status: "" })}>Clear</Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVerifiers.map((verifier) => (
                <tr key={verifier._id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{verifier.name || "-"}</td>
                  <td className="px-3 py-2">{verifier.village || "-"}</td>
                  <td className="px-3 py-2">{verifier.taluka || "-"}</td>
                  <td className="px-3 py-2">{verifier.district || "-"}</td>
                  <td className="px-3 py-2">{verifier.pincode || "-"}</td>
                  <td className="px-3 py-2">{verifier.contact || "-"}</td>
                  <td className="px-3 py-2">
                    <Badge className="px-2 py-1 text-xs">{verifier.applicationStatus || "-"}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openVerifierDetails(verifier)}>View</Button>
                      {onEdit && (
                        <Button variant="outline" size="sm" onClick={() => openVerifierDetails(verifier)}>
                          Edit
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
      <>
      {/* Grid of Small Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filteredVerifiers.map((verifier) => (
          <Card
            key={verifier._id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-white border border-gray-200"
            onClick={() => openVerifierDetails(verifier)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center space-y-2">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                {/* Name */}
                <div>
                  <h3
                    className="font-medium text-gray-900 text-sm truncate w-full"
                    title={verifier.name}
                  >
                    {verifier.name}
                  </h3>
                </div>
                {/* Location Info */}
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-center space-x-1 text-xs text-gray-600">
                    <MapPin className="w-2.5 h-2.5" />
                    <span className="truncate" title={verifier.village}>
                      {verifier.village}
                    </span>
                  </div>
                  <p
                    className="text-xs text-gray-500 truncate"
                    title={verifier.taluka}
                  >
                    {verifier.taluka}
                  </p>
                </div>
                {/* View Details Button */}
                <div className="pt-1">
                  <div className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800">
                    <Eye className="w-2.5 h-2.5" />
                    <span className="text-xs">Details</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </>
      )}
      {/* Overlay Modal */}
      {selectedVerifier && (
        <VerifierDetailOverlay
          verifier={selectedVerifier}
          onClose={closeVerifierDetails}
          onEdit={onEdit}
        />
      )}
    </div>
  );
};

export default VerifierCard
