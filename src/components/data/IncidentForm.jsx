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
  Image,
} from "lucide-react";
import LocationPrecisionModal from "./LocationPrecisionModal";
import { sendIncidentEmail } from "../../utils/emailService";
import ImageUpload from "./ImageUpload";
import { uploadIncidentImages, validateImages, prepareImageDataForDatabase } from "../../utils/imageService";

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
    images: [],
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
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedTypeIncident, setSelectedTypeIncident] = useState(null);

  // États pour les ajouts dynamiques
  const [newMatricule, setNewMatricule] = useState("");
  const [newCameraId, setNewCameraId] = useState("");
  const [matriculeValidation, setMatriculeValidation] = useState("");
  const [cameraValidation, setCameraValidation] = useState("");

  // États pour la gestion des images
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImages, setUploadingImages] = useState(false);

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

        // Fetch entreprises
        const entreprisesSnapshot = await getDocs(collection(db, "entreprise"));
        const entreprisesList = entreprisesSnapshot.docs.map((doc) => ({
          id: doc.id,
          nomEntreprise: doc.data().nomEntreprise,
        }));
        setEntreprises(entreprisesList.sort((a, b) => a.nomEntreprise.localeCompare(b.nomEntreprise)));

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
    if (!isEditMode && !isViewMode && formData.date && formData.categorie) {
      generateReference();
    }
  }, [formData.date, formData.categorie, isEditMode, isViewMode]);

  // Load incident data for edit/view mode
  useEffect(() => {
    const loadIncidentData = async () => {
      if ((isEditMode || isViewMode) && id) {
        try {
          const incidentDoc = await getDoc(doc(db, "incidents", id));
          if (incidentDoc.exists()) {
            const data = incidentDoc.data();
            setFormData(data);
            
            // Convertir les images de la base de données en format pour le composant
            if (data.images && data.images.length > 0) {
              console.log("📸 Images chargées depuis la DB:", data.images);
              const imagesPreviews = data.images.map((img, index) => ({
                id: `existing_${index}`,
                url: img.url,
                name: img.name || `Image ${index + 1}`,
                size: img.size || 0,
                path: img.path,
                uploadedAt: img.uploadedAt,
                isExisting: true
              }));
              setSelectedImages(imagesPreviews);
              console.log("📸 Images converties pour le composant:", imagesPreviews);
            }
          }
        } catch (error) {
          console.error("Erreur lors du chargement de l'incident:", error);
          setError("Erreur lors du chargement de l'incident");
        }
      }
    };

    loadIncidentData();
  }, [id, isEditMode, isViewMode]);

  const generateReference = async () => {
    try {
      if (!formData.categorie) return;

      const dateStr = formData.date.replace(/-/g, '');
      const categoriePrefix = formData.categorie
        .substring(0, 3)
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const monthStr = formData.date.substring(0, 7).replace('-', '');

      // Count incidents for this month
      const incidentsSnapshot = await getDocs(
        query(collection(db, "incidents"), where("mois", "==", monthStr))
      );
      const count = incidentsSnapshot.docs.length + 1;
      const countStr = count.toString().padStart(3, '0');

      const reference = `${dateStr}-${categoriePrefix}-${countStr}`;
      setFormData(prev => ({ ...prev, reference }));
    } catch (err) {
      console.error("Erreur lors de la génération de la référence:", err);
    }
  };

  const generateReferenceForImages = async (date, categorie) => {
    try {
      const dateStr = date.replace(/-/g, '');
      const categoriePrefix = categorie
        .substring(0, 3)
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const monthStr = date.substring(0, 7).replace('-', '');

      // Count incidents for this month
      const incidentsSnapshot = await getDocs(
        query(collection(db, "incidents"), where("mois", "==", monthStr))
      );
      const count = incidentsSnapshot.docs.length + 1;
      const countStr = count.toString().padStart(3, '0');

      return `${dateStr}-${categoriePrefix}-${countStr}`;
    } catch (err) {
      console.error("Erreur lors de la génération de la référence:", err);
      return `${date.replace(/-/g, '')}-${categorie.substring(0, 3).toUpperCase()}-001`;
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

  const handleImagesChange = (images) => {
    setSelectedImages(images);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation des images
      if (selectedImages.length > 0) {
        const imageValidation = validateImages(selectedImages);
        if (!imageValidation.valid) {
          setError(imageValidation.errors.join(', '));
          return;
        }
      }

      const dateTime = new Date(`${formData.date}T${formData.heure}`);
      const dateLong = dateTime.toISOString();
      const mois = formData.date.substring(0, 7).replace('-', '');
      const annee = formData.date.substring(0, 4);

      let uploadedImages = [];

      // Upload des nouvelles images (pour nouveaux incidents ET modifications)
      if (selectedImages.length > 0) {
        // Séparer les nouvelles images des images existantes
        const newImages = selectedImages.filter(img => !img.isExisting);
        const existingImages = selectedImages.filter(img => img.isExisting);
        
        console.log("📸 Images sélectionnées:", selectedImages);
        console.log("📸 Nouvelles images à uploader:", newImages);
        console.log("📸 Images existantes conservées:", existingImages);
        
        // Préparer les images existantes pour la base de données
        uploadedImages = existingImages.map(img => ({
          url: img.url,
          path: img.path,
          name: img.name,
          size: img.size,
          uploadedAt: img.uploadedAt || new Date().toISOString()
        }));
        
        if (newImages.length > 0) {
          // Vérifier que l'utilisateur est authentifié
          if (!user) {
            setError("Utilisateur non authentifié. Veuillez vous reconnecter.");
            return;
          }
          
          setUploadingImages(true);
          
          // Générer une référence pour nommer les images
          const tempReference = isEditMode 
            ? formData.reference 
            : await generateReferenceForImages(formData.date, formData.categorie);
          
          const uploadResult = await uploadIncidentImages(
            newImages, // Uploader seulement les nouvelles images
            tempReference,
            (current, total) => {
              setUploadProgress(Math.round((current / total) * 100));
            }
          );

          if (!uploadResult.success) {
            setError(`Erreur lors de l'upload des images: ${uploadResult.failed[0]?.error || 'Erreur inconnue'}`);
            return;
          }

          // Combiner les images existantes avec les nouvelles uploadées
          const newUploadedImages = prepareImageDataForDatabase(uploadResult);
          uploadedImages = [...uploadedImages, ...newUploadedImages];
          setUploadingImages(false);
        }
      }

      const incidentData = {
        ...formData,
        images: uploadedImages,
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
          console.log("🔄 Envoi de l'email d'incident en cours...");
          console.log("Données de l'incident:", incidentData);
          
          const emailResult = await sendIncidentEmail(incidentData);
          
          if (emailResult.success) {
            console.log("✅ Email envoyé avec succès:", emailResult.message);
          } else {
            console.error("❌ Erreur lors de l'envoi de l'email:", emailResult.error);
          }
        } catch (emailError) {
          console.error("💥 Exception lors de l'envoi de l'email:", emailError);
        }
      }

      navigate("/operations/incidents");
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      setError("Erreur lors de l'enregistrement: " + err.message);
    } finally {
      setLoading(false);
      setUploadingImages(false);
      setUploadProgress(0);
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

  const getCategorieColor = (categorie) => {
    switch (categorie) {
      case "Sécurité":
        return "bg-red-100 text-red-800";
      case "Sûreté":
        return "bg-blue-100 text-blue-800";
      case "Informations":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium text-gray-600">
                Data/{isViewMode ? "Détails de l'incident" : isEditMode ? "Modifier l'incident" : "Incidents"}
              </h1>
              <p className="text-gray-600 text-sm">
                {isViewMode ? "Consulter les informations de l'incident" : isEditMode ? "Mettre à jour les informations de l'incident" : "Créer un nouveau rapport d'incident"}
              </p>
            </div>
            <button
              onClick={() => navigate("/operations/incidents")}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white hover:bg-white hover:text-black hover:border-black border border-transparent rounded-full transition-all duration-200 shadow-sm font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la liste des incidents</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Date et Heure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-gray-100 rounded">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <span>Date</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-gray-100 rounded">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <span>Heure</span>
                  </label>
                  <input
                    type="time"
                    name="heure"
                    value={formData.heure}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                    required
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Zone et Lieu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-gray-100 rounded">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <span>Zone</span>
                  </label>
                  <select
                    name="zone"
                    value={formData.zone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
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
                    <div className="p-1 bg-gray-100 rounded">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <span>Lieu</span>
                  </label>
                  <select
                    name="lieu"
                    value={formData.lieu}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.zone || isViewMode}
                  >
                    <option value="">Sélectionner un lieu</option>
                    {filteredLieux
                      .sort((a, b) => a.nomLieu.localeCompare(b.nomLieu))
                      .map((lieu) => (
                        <option key={lieu.id} value={lieu.id}>
                          {lieu.nomLieu}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Précision de localisation */}
              {formData.precision && (
                <div className="bg-gray-50 border border-gray-200 rounded-full p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <Navigation className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Position précise</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Lat: {formData.precision.lat?.toFixed(6)}, Lng: {formData.precision.lng?.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => setLocationModalOpen(true)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 font-medium text-xs cursor-pointer"
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
                    <div className="p-1 bg-gray-100 rounded">
                      <Shield className="w-4 h-4 text-gray-600" />
                    </div>
                    <span>Catégorie</span>
                  </label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                    required
                    disabled={isViewMode}
                  >
                    <option value="Sécurité">Sécurité</option>
                    <option value="Sûreté">Sûreté</option>
                    <option value="Informations">Informations</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-gray-100 rounded">
                      <AlertTriangle className="w-4 h-4 text-gray-600" />
                    </div>
                    <span>Type d'incident</span>
                  </label>
                  <select
                    name="typeIncident"
                    value={formData.typeIncident}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.categorie || isViewMode}
                  >
                    <option value="">Sélectionner un type d'incident</option>
                    {filteredTypeIncidents
                      .sort((a, b) => a.nomIncident.localeCompare(b.nomIncident))
                      .map((type) => (
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
                    <div className="p-1 bg-gray-100 rounded">
                      <Target className="w-4 h-4 text-gray-600" />
                    </div>
                    <span>Niveau d'impact</span>
                  </label>
                  <select
                    name="niveauImpact"
                    value={formData.niveauImpact}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm font-medium ${getNiveauColor(formData.niveauImpact)}`}
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
                    <div className="p-1 bg-gray-100 rounded">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <span>Primo intervenant</span>
                  </label>
                  <input
                    list="entreprises-list"
                    name="primo"
                    value={formData.primo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                    placeholder="Saisir ou sélectionner une entreprise"
                    required
                    disabled={isViewMode}
                  />
                  <datalist id="entreprises-list">
                    <option value="ISP" />
                    {entreprises.map((entreprise) => (
                      <option key={entreprise.id} value={entreprise.nomEntreprise} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Quantité (conditionnelle) */}
              {selectedTypeIncident?.quantite && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <div className="p-1 bg-gray-100 rounded">
                      <Package className="w-4 h-4 text-gray-600" />
                    </div>
                    <span>Quantité</span>
                  </label>
                  <div className="max-w-sm">
                    <input
                      type="number"
                      name="quantite"
                      value={formData.quantite}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
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
                  <div className="p-1 bg-gray-100 rounded">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Intervenants ISP</span>
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMatricule}
                    onChange={(e) => setNewMatricule(e.target.value)}
                    placeholder="Saisir le matricule du personnel"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleMatriculeAdd())}
                    disabled={isViewMode}
                  />
                  <button
                    type="button"
                    onClick={handleMatriculeAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 font-medium text-sm cursor-pointer disabled:cursor-not-allowed"
                    disabled={isViewMode}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
                {matriculeValidation && (
                  <div className="flex items-center space-x-2 text-gray-600 text-sm bg-red-50 p-3 rounded-full">
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
                        <span className="text-gray-600 font-mono text-xs">({personnel.matricule})</span>
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => handleMatriculeRemove(personnelId)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-gray-100 rounded-full cursor-pointer"
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCameraAdd())}
                    disabled={isViewMode}
                  />
                  <button
                    type="button"
                    onClick={handleCameraAdd}
                    className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2 font-medium text-sm cursor-pointer disabled:cursor-not-allowed"
                    disabled={isViewMode}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
                {cameraValidation && (
                  <div className="flex items-center space-x-2 text-gray-600 text-sm bg-red-50 p-3 rounded-full">
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
                            className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-gray-100 rounded">
                    <Image className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Images de l'incident</span>
                  <span className="text-xs text-gray-500">(optionnel - max 3 images)</span>
                </label>
                
                {uploadingImages && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-blue-700 text-sm font-medium">
                        Upload en cours... ({uploadProgress}%)
                      </span>
                    </div>
                    <div className="mt-2 bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <ImageUpload
                  images={selectedImages}
                  onImagesChange={handleImagesChange}
                  disabled={isViewMode || uploadingImages}
                  maxImages={3}
                  maxSizeBytes={5 * 1024 * 1024} // 5MB
                />
              </div>

              {/* Détails */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-gray-100 rounded">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Détails de l'incident</span>
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-gray-50 text-sm"
                  placeholder="Décrire les détails de l'incident, les circonstances, les actions menées..."
                  disabled={isViewMode}
                />
              </div>

              {/* Erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-gray-600" />
                    <p className="text-gray-600 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Boutons */}
              {!isViewMode && (
                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate("/operations/incidents")}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-all duration-200 font-medium border border-gray-300 text-sm cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm cursor-pointer"
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
          currentLieuId={formData.lieu} // Passer l'ID du lieu actuel pour le différencier
        />
      )}
    </div>
  );
}

export default IncidentForm;