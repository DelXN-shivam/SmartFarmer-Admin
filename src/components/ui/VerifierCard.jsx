"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Phone, FileText, User, Eye, X, Edit, Save, XCircle, Map } from "lucide-react"

const VerifierCard = ({ verifiers, onVerify, onEdit }) => {
  const [selectedVerifier, setSelectedVerifier] = useState(null)
  const [loading, setLoading] = useState(false)
  const maskAadhaar = (aadhaar) => aadhaar?.replace(/(\d{4})(\d{4})(\d{4})/, "****-****-$3") || "Not provided"
  const formatDocumentName = (doc) =>
    doc
      .replace(/[_-]/g, " ")
      .replace(/\.(jpg|pdf|png)$/i, "")
      .toUpperCase()
  const openVerifierDetails = (verifier) => setSelectedVerifier(verifier)
  const closeVerifierDetails = () => setSelectedVerifier(null)

  const VerifierDetailOverlay = ({ verifier, onClose, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editableVerifier, setEditableVerifier] = useState(() => ({
      ...verifier,
      location: verifier.location ? { ...verifier.location } : undefined,
      submittedDocuments: verifier.submittedDocuments ? [...verifier.submittedDocuments] : [],
      allocatedTaluka: verifier.allocatedTaluka ? [...verifier.allocatedTaluka] : [],
    }))

    const handleInputChange = (e) => {
      const { name, value } = e.target
      setEditableVerifier((prev) => ({ ...prev, [name]: value }))
    }

    const handleAllocatedTalukasChange = (e) => {
      const value = e.target.value
      setEditableVerifier((prev) => ({
        ...prev,
        allocatedTaluka: value.split(",").map((t) => t.trim()),
      }))
    }

    const handleSave = () => {
      if (onEdit) {
        onEdit(editableVerifier) // Pass the updated verifier data to the parent
      }
      setIsEditing(false)
      onClose()
    }

    const handleCancel = () => {
      setEditableVerifier(() => ({
        ...verifier,
        location: verifier.location ? { ...verifier.location } : undefined,
        submittedDocuments: verifier.submittedDocuments ? [...verifier.submittedDocuments] : [],
        allocatedTaluka: verifier.allocatedTaluka ? [...verifier.allocatedTaluka] : [],
      }))
      setIsEditing(false)
    }

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
                  <p className="text-white/90 text-sm">Verifier • ID: {verifier._id?.slice(-8)}</p>
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
                  <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
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
                      <p className="font-semibold text-gray-900">{verifier.contact || "N/A"}</p>
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
                        <p className="font-semibold text-gray-900">{verifier.email || "N/A"}</p>
                      )}
                    </div>
                  )}
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label htmlFor="aadhaarNumber" className="text-sm text-gray-500">
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
                      <p className="font-semibold text-gray-900">{maskAadhaar(verifier.aadhaarNumber)}</p>
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
                  <h3 className="text-xl font-bold text-gray-900">Address Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="village" className="text-sm text-gray-500">
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
                          <p className="font-semibold text-gray-900">{verifier.village || "N/A"}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="taluka" className="text-sm text-gray-500">
                          Taluka
                        </Label>
                        {isEditing ? (
                          <Input
                            id="taluka"
                            name="taluka"
                            value={editableVerifier.taluka || ""}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-semibold text-gray-900">{verifier.taluka || "N/A"}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="district" className="text-sm text-gray-500">
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
                          <p className="font-semibold text-gray-900">{verifier.district || "N/A"}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pincode" className="text-sm text-gray-500">
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
                          <p className="font-semibold text-gray-900">{verifier.pincode || "N/A"}</p>
                        )}
                      </div>
                    </div>
                    {verifier.landMark && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <Label htmlFor="landMark" className="text-sm text-gray-500">
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
                          <p className="font-semibold text-gray-900">{verifier.landMark || "N/A"}</p>
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
            {verifier.submittedDocuments && verifier.submittedDocuments.length > 0 && (
              <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Submitted Documents</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {verifier.submittedDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900 truncate">{formatDocumentName(doc)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Allocated Talukas Section */}
            <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Map className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Allocated Talukas</h3>
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="allocatedTaluka" className="text-sm text-gray-500">
                    Edit Talukas (comma-separated)
                  </Label>
                  <Input
                    id="allocatedTaluka"
                    name="allocatedTaluka"
                    value={editableVerifier.allocatedTaluka?.join(", ") || ""}
                    onChange={handleAllocatedTalukasChange}
                    className="mt-1"
                    placeholder="e.g., Taluka A, Taluka B"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {verifier.allocatedTaluka && verifier.allocatedTaluka.length > 0 ? (
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
                    <p className="text-sm text-gray-500">No talukas allocated.</p>
                  )}
                </div>
              )}
            </div>
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
    )
  }

  if (!verifiers || verifiers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No verifiers found.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <p className="text-gray-600 mb-6">
        Showing {verifiers.length} Verifier{verifiers.length !== 1 ? "s" : ""}
      </p>
      {/* Grid of Small Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {verifiers.map((verifier) => (
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
                  <h3 className="font-medium text-gray-900 text-sm truncate w-full" title={verifier.name}>
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
                  <p className="text-xs text-gray-500 truncate" title={verifier.taluka}>
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
      {/* Overlay Modal */}
      {selectedVerifier && (
        <VerifierDetailOverlay
          verifier={selectedVerifier}
          onClose={closeVerifierDetails}
          onEdit={onEdit}
        />
      )}
    </div>
  )
}

export default VerifierCard