import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Camera,
  Save,
  ArrowLeft,
  Plus,
  X,
  Hash,
  Package,
  Shield,
  Target,
  FileText,
  CheckCircle,
  AlertCircle,
  Navigation,
} from "lucide-react";
import LocationPrecisionModal from "./LocationPrecisionModal";
import { sendIncidentEmail } from "../../utils/emailService";

function IncidentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const isEditMode = Boolean(id) && window.location.pathname.includes('/edit/');
  const isViewMode = Boolean(id) && window.location.pathname.includes('/view/');

  const [formData, setFormData] = useState({
    reference: "",
    date: new Date().toISOString().split("T")[0],
    heure: new Date().toTimeString().slice(0, 5),
    zone: "",
    lieu: "",
    precision: null,
    categorie: "Sécurité",
    typeIncident: "",
    niveauImpact: "Négligeable",
    quantite: "",
    primo: "ISP",
    intervenantsISP: [],
    cameras: [],
    details: "",
    user: "",
    dateEnreg: new Date().toISOString(),
    dateLong: "",
    mois: "",
    annee: "",
    supprimer: false,
  });

  const [zones, setZones] = useState([]);
  const [lieux, setLieux] = useState([]);
  const [filteredLieux, setFilteredLieux] = useState([]);
  const [typeIncidents, setTypeIncidents] = useState([]);
  const [filteredTypeIncidents, setFilteredTypeIncidents] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedTypeIncident, setSelectedTypeIncident] = useState(null);

  // États pour les ajouts dynamiques
  const [newMatricule, setNewMatricule] = useState("");
  const [newCameraId, setNewCameraId] = useState("");
  const [matriculeValidation, setMatriculeValidation] = useState("");
  const [cameraValidation, setCameraValidation] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          setFormData(prev => ({ ...prev, user: user.uid }));
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch zones
        const zonesSnapshot = await getDocs(
          query(collection(db, "zones"), where("active", "==", true))
        );
        const zonesList = zonesSnapshot.docs.map((doc) => ({
          id: doc.id,
          nomZone: doc.data().nomZone,
        }));
        setZones(zonesList);

        // Fetch lieux
        const lieuxSnapshot = await getDocs(
          query(collection(db, "lieux"), where("active", "==", true))
        );
        const lieuxList = lieuxSnapshot.docs.map((doc) => ({
          id: doc.id,
          nomLieu: doc.data().nomLieu,
          zone: doc.data().zone,
          localisation: doc.data().localisation,
        }));
        setLieux(lieuxList);

        // Fetch type incidents
        const typeIncidentsSnapshot = await getDocs(
          query(collection(db, "typeIncident"), where("active", "==", true))
        );
        const typeIncidentsList = typeIncidentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          nomIncident: doc.data().nomIncident,
          categorie: doc.data().categorie,
          quantite: doc.data().quantite || false,
        }));
        setTypeIncidents(typeIncidentsList);

        // Fetch personnels
        const personnelsSnapshot = await getDocs(
          query(collection(db, "personnels"), where("active", "==", true))
        );
        const personnelsList = personnelsSnapshot.docs.map((doc) => ({
          id: doc.id,
          matricule: doc.data().matricule,
          nomPrenom: doc.data().nomPrenom,
        }));
        setPersonnels(personnelsList);

        // Fetch cameras
        const camerasSnapshot = await getDocs(collection(db, "cameras"));
        const camerasList = camerasSnapshot.docs.map((doc) => ({
          id: doc.id,
          idCamera: doc.data().idCamera,
        }));
        setCameras(camerasList);

        // If edit mode or view mode, fetch incident data
        if (isEditMode || isViewMode) {
          const incidentDoc = await getDoc(doc(db, "incidents", id));
          if (incidentDoc.exists()) {
            const incidentData = incidentDoc.data();
            setFormData(prev => ({
              ...prev,
              ...incidentData,
              date: incidentData.date || "",
              heure: incidentData.heure || "",
            }));
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données");
      }
    };

    fetchData();
  }, [isEditMode, isViewMode, id]);

  // Filter lieux based on selected zone
  useEffect(() => {
    if (formData.zone) {
      const filtered = lieux.filter(lieu => lieu.zone === formData.zone);
      setFilteredLieux(filtered);
      if (formData.lieu && !filtered.some(lieu => lieu.id === formData.lieu)) {
        setFormData(prev => ({ ...prev, lieu: "", precision: null }));
      }
    } else {
      setFilteredLieux([]);
      setFormData(prev => ({ ...prev, lieu: "", precision: null }));
    }
  }, [formData.zone, lieux]);

  // Filter type incidents based on selected category
  useEffect(() => {
    if (formData.categorie) {
      const filtered = typeIncidents.filter(
        type => type.categorie === formData.categorie
      );
      setFilteredTypeIncidents(filtered);
      if (formData.typeIncident && !filtered.some(type => type.id === formData.typeIncident)) {
        setFormData(prev => ({ ...prev, typeIncident: "" }));
      }
    } else {
      setFilteredTypeIncidents([]);
      setFormData(prev => ({ ...prev, typeIncident: "" }));
    }
  }, [formData.categorie, typeIncidents]);

  // Set default precision when lieu is selected
  useEffect(() => {
    if (formData.lieu && lieux.length > 0) {
      const selectedLieu = lieux.find(lieu => lieu.id === formData.lieu);
      if (selectedLieu && selectedLieu.localisation) {
        setFormData(prev => ({ ...prev, precision: selectedLieu.localisation }));
      }
    }
  }, [formData.lieu, lieux]);

  // Set selected type incident for quantity validation
  useEffect(() => {
    if (formData.typeIncident) {
      const selected = typeIncidents.find(type => type.id === formData.typeIncident);
      setSelectedTypeIncident(selected);
    } else {
      setSelectedTypeIncident(null);
    }
  }, [formData.typeIncident, typeIncidents]);

  // Generate reference for new incidents
  useEffect(() => {
    if (!isEditMode && !isViewMode && formData.date && formData.typeIncident) {
      generateReference();
    }
  }, [formData.date, formData.typeIncident, isEditMode, isViewMode]);

  const generateReference = async () => {
    try {
      const selectedType = typeIncidents.find(type => type.id === formData.typeIncident);
      if (!selectedType) return;

      const dateStr = formData.date.replace(/-/g, '');
      const typePrefix = selectedType.nomIncident.substring(0, 3).toUpperCase();
      const monthStr = formData.date.substring(0, 7).replace('-', '');

      // Count incidents for this month
      const incidentsSnapshot = await getDocs(
        query(collection(db, "incidents"), where("mois", "==", monthStr))
      );
      const count = incidentsSnapshot.docs.length + 1;
      const countStr = count.toString().padStart(3, '0');

      const reference = `${dateStr}-${typePrefix}-${countStr}`;
      setFormData(prev => ({ ...prev, reference }));
    } catch (err) {
      console.error("Erreur lors de la génération de la référence:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMatriculeAdd = () => {
    if (!newMatricule.trim()) return;

    const personnel = personnels.find(p => p.matricule === newMatricule.trim());
    if (!personnel) {
      setMatriculeValidation("Matricule non trouvé");
      return;
    }

    if (formData.intervenantsISP.includes(personnel.id)) {
      setMatriculeValidation("Personnel déjà ajouté");
      return;
    }

    setFormData(prev => ({
      ...prev,
      intervenantsISP: [...prev.intervenantsISP, personnel.id]
    }));
    setNewMatricule("");
    setMatriculeValidation("");
  };

  const handleMatriculeRemove = (personnelId) => {
    setFormData(prev => ({
      ...prev,
      intervenantsISP: prev.intervenantsISP.filter(id => id !== personnelId)
    }));
  };

  const handleCameraAdd = () => {
    if (!newCameraId.trim()) return;

    const camera = cameras.find(c => c.idCamera === newCameraId.trim());
    if (!camera) {
      setCameraValidation("Caméra non trouvée");
      return;
    }

    if (formData.cameras.includes(camera.id)) {
      setCameraValidation("Caméra déjà ajoutée");
      return;
    }

    setFormData(prev => ({
      ...prev,
      cameras: [...prev.cameras, camera.id]
    }));
    setNewCameraId("");
    setCameraValidation("");
  };

  const handleCameraRemove = (cameraId) => {
    setFormData(prev => ({
      ...prev,
      cameras: prev.cameras.filter(id => id !== cameraId)
    }));
  };

  const handleLocationUpdate = (newLocation) => {
    setFormData(prev => ({ ...prev, precision: newLocation }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dateTime = new Date(`${formData.date}T${formData.heure}`);
      const dateLong = dateTime.toISOString();
      const mois = formData.date.substring(0, 7).replace('-', '');
      const annee = formData.date.substring(0, 4);

      const incidentData = {
        ...formData,
        dateLong,
        mois,
        annee,
        dateEnreg: isEditMode ? formData.dateEnreg : new Date().toISOString(),
      };

      if (isEditMode) {
        await setDoc(doc(db, "incidents", id), incidentData, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, "incidents"), incidentData);
        
        // Envoyer l'email de notification pour les nouveaux incidents
        try {
          const emailResult = await sendIncidentEmail(incidentData);
          if (emailResult.success) {
            console.log("Email envoyé avec succès");
          } else {
            console.error("Erreur lors de l'envoi de l'email:", emailResult.error);
          }
        } catch (emailError) {
          console.error("Erreur lors de l'envoi de l'email:", emailError);
        }
      }

      navigate("/operations/incidents");
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      setError("Erreur lors de l'enregistrement: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getNiveauColor = (niveau) => {
    switch (niveau) {
      case "Négligeable":
        return "bg-green-50 text-green-700 border-green-200";
      case "Modéré":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Majeur":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Catastrophique":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isViewMode ? "Détails de l'incident" : isEditMode ? "Modifier l'incident" : "Nouvel incident"}
                </h1>
                <p className="text-gray-600 text-sm">
                  {isViewMode ? "Consulter les informations de l'incident" : isEditMode ? "Mettre à jour les informations de l'incident" : "Créer un nouveau rapport d'incident"}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/operations/incidents")}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Retour à la liste des incidents</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Référence */}
              {formData.reference && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Hash className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Référence de l'incident</h3>
                      <p className="text-2xl font-mono font-bold text-blue-600 mt-1">
                        {formData.reference}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Date et Heure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-blue-100 rounded">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Date</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-blue-100 rounded">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Heure</span>
                  </label>
                  <input
                    type="time"
                    name="heure"
                    value={formData.heure}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Zone et Lieu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-green-100 rounded">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <span>Zone</span>
                  </label>
                  <select
                    name="zone"
                    value={formData.zone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                    disabled={isViewMode}
                  >
                    <option value="">Sélectionner une zone</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.nomZone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-green-100 rounded">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <span>Lieu</span>
                  </label>
                  <select
                    name="lieu"
                    value={formData.lieu}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.zone || isViewMode}
                  >
                    <option value="">Sélectionner un lieu</option>
                    {filteredLieux.map((lieu) => (
                      <option key={lieu.id} value={lieu.id}>
                        {lieu.nomLieu}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Précision de localisation */}
              {formData.precision && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Navigation className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Position précise</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Lat: {formData.precision.lat?.toFixed(6)}, Lng: {formData.precision.lng?.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => setLocationModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        Préciser la position
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Catégorie et Type d'incident */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-purple-100 rounded">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <span>Catégorie</span>
                  </label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                    disabled={isViewMode}
                  >
                    <option value="Sécurité">Sécurité</option>
                    <option value="Sureté">Sureté</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-red-100 rounded">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <span>Type d'incident</span>
                  </label>
                  <select
                    name="typeIncident"
                    value={formData.typeIncident}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.categorie || isViewMode}
                  >
                    <option value="">Sélectionner un type d'incident</option>
                    {filteredTypeIncidents.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.nomIncident}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Niveau d'impact et Primo intervenant */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-orange-100 rounded">
                      <Target className="w-4 h-4 text-orange-600" />
                    </div>
                    <span>Niveau d'impact</span>
                  </label>
                  <select
                    name="niveauImpact"
                    value={formData.niveauImpact}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md font-medium ${getNiveauColor(formData.niveauImpact)}`}
                    required
                    disabled={isViewMode}
                  >
                    <option value="Négligeable">Négligeable</option>
                    <option value="Modéré">Modéré</option>
                    <option value="Majeur">Majeur</option>
                    <option value="Catastrophique">Catastrophique</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-blue-100 rounded">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Primo intervenant</span>
                  </label>
                  <select
                    name="primo"
                    value={formData.primo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                    disabled={isViewMode}
                  >
                    <option value="ISP">ISP</option>
                    <option value="Extérieur">Extérieur</option>
                  </select>
                </div>
              </div>

              {/* Quantité (conditionnelle) */}
              {selectedTypeIncident?.quantite && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-indigo-100 rounded">
                      <Package className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span>Quantité</span>
                  </label>
                  <div className="max-w-sm">
                    <input
                      type="number"
                      name="quantite"
                      value={formData.quantite}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      placeholder="Saisir la quantité"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Intervenants ISP */}
              <div className="space-y-4">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-blue-100 rounded">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Intervenants ISP</span>
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMatricule}
                    onChange={(e) => setNewMatricule(e.target.value)}
                    placeholder="Saisir le matricule du personnel"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleMatriculeAdd())}
                    disabled={isViewMode}
                  />
                  <button
                    type="button"
                    onClick={handleMatriculeAdd}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl"
                    disabled={isViewMode}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
                {matriculeValidation && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{matriculeValidation}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {formData.intervenantsISP.map((personnelId) => {
                    const personnel = personnels.find(p => p.id === personnelId);
                    return personnel ? (
                      <div
                        key={personnelId}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm border border-blue-300 shadow-sm"
                      >
                        <span className="font-medium">{personnel.nomPrenom}</span>
                        <span className="text-blue-600 font-mono text-xs">({personnel.matricule})</span>
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => handleMatriculeRemove(personnelId)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-100 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Caméras */}
              <div className="space-y-4">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-gray-100 rounded">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Caméras</span>
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newCameraId}
                    onChange={(e) => setNewCameraId(e.target.value)}
                    placeholder="Saisir l'ID de la caméra"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCameraAdd())}
                    disabled={isViewMode}
                  />
                  <button
                    type="button"
                    onClick={handleCameraAdd}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl"
                    disabled={isViewMode}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
                {cameraValidation && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{cameraValidation}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {formData.cameras.map((cameraId) => {
                    const camera = cameras.find(c => c.id === cameraId);
                    return camera ? (
                      <div
                        key={cameraId}
                        className="flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm border border-gray-300 shadow-sm"
                      >
                        <Camera className="w-3 h-3" />
                        <span className="font-medium">{camera.idCamera}</span>
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => handleCameraRemove(cameraId)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-100 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Détails */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-teal-100 rounded">
                    <FileText className="w-4 h-4 text-teal-600" />
                  </div>
                  <span>Détails de l'incident</span>
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-white shadow-sm hover:shadow-md"
                  placeholder="Décrire les détails de l'incident, les circonstances, les actions menées..."
                  disabled={isViewMode}
                />
              </div>

              {/* Erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-600 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Boutons */}
              {!isViewMode && (
                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate("/operations/incidents")}
                    className="px-8 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium border border-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{isEditMode ? "Mettre à jour l'incident" : "Enregistrer l'incident"}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Modal de précision de localisation */}
      {locationModalOpen && (
        <LocationPrecisionModal
          isOpen={locationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          defaultLocation={formData.precision}
          lieuLocation={lieux.find(l => l.id === formData.lieu)?.localisation}
          onLocationUpdate={handleLocationUpdate}
        />
      )}
    </div>
  );
}

export default IncidentForm;