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
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import {
  Users,
  X,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Shield,
  Save,
  Loader2,
  Building,
  User,
  Hash,
  CheckCircle,
  XCircle,
} from "lucide-react";

function IndividusInterpellesFormModal({ isOpen, onClose, individuId, isEditMode }) {
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);

  const [formData, setFormData] = useState({
    dateHeureAlerte: "",
    vacation: "",
    zone: "",
    lieu: "",
    equipe: "",
    motif: "",
    nomIndividu: "",
    primoIntervenant: "",
    intervenants: [],
    dateHeureIntervention: "",
    valider: false,
    enregistrePar: "",
    dateEnregistrement: new Date().toISOString(),
    dateLong: "",
  });

  const [zones, setZones] = useState([]);
  const [lieux, setLieux] = useState([]);
  const [filteredLieux, setFilteredLieux] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [filteredEquipes, setFilteredEquipes] = useState([]);
  const [motifsSaisie, setMotifsSaisie] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // États pour la gestion des intervenants
  const [selectedPersonnel, setSelectedPersonnel] = useState("");
  const [matriculeValidation, setMatriculeValidation] = useState("");

  // État pour l'entreprise personnalisée
  const [showEntrepriseInput, setShowEntrepriseInput] = useState(false);
  const [customEntreprise, setCustomEntreprise] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
      fetchCollections();
      if (isEditMode && individuId) {
        loadIndividuData();
      } else if (!isEditMode && individuId && typeof individuId === 'object') {
        // Mode duplication
        const individuToDuplicate = individuId;
        setFormData({
          dateHeureAlerte: "",
          vacation: individuToDuplicate.vacation || "",
          zone: individuToDuplicate.zone || "",
          lieu: individuToDuplicate.lieu || "",
          equipe: individuToDuplicate.equipe || "",
          motif: individuToDuplicate.motif || "",
          nomIndividu: "",
          primoIntervenant: individuToDuplicate.primoIntervenant || "",
          intervenants: individuToDuplicate.intervenants || [],
          dateHeureIntervention: "",
          valider: false,
          enregistrePar: user?.uid || "",
          dateEnregistrement: new Date().toISOString(),
          dateLong: "",
        });
      } else {
        // Mode création
        setFormData({
          dateHeureAlerte: "",
          vacation: "",
          zone: "",
          lieu: "",
          equipe: "",
          motif: "",
          nomIndividu: "",
          primoIntervenant: "ISP",
          intervenants: [],
          dateHeureIntervention: "",
          valider: false,
          enregistrePar: user?.uid || "",
          dateEnregistrement: new Date().toISOString(),
          dateLong: "",
        });
      }
    }
  }, [isOpen, individuId, isEditMode, user]);

  // Filtrer les lieux en fonction de la zone sélectionnée
  useEffect(() => {
    if (formData.zone) {
      const filtered = lieux.filter(lieu => lieu.zone === formData.zone);
      setFilteredLieux(filtered);
      // Si le lieu actuel n'est pas dans la zone sélectionnée, le réinitialiser
      if (formData.lieu && !filtered.some(lieu => lieu.id === formData.lieu)) {
        setFormData(prev => ({ ...prev, lieu: "" }));
      }
    } else {
      setFilteredLieux([]);
      setFormData(prev => ({ ...prev, lieu: "" }));
    }
  }, [formData.zone, lieux]);

  // Filtrer les équipes en fonction de la zone sélectionnée
  useEffect(() => {
    if (formData.zone) {
      const filtered = equipes.filter(equipe => equipe.zone === formData.zone);
      setFilteredEquipes(filtered);
      // Si l'équipe actuelle n'est pas dans la zone sélectionnée, la réinitialiser
      if (formData.equipe && !filtered.some(equipe => equipe.id === formData.equipe)) {
        setFormData(prev => ({ ...prev, equipe: "" }));
      }
    } else {
      setFilteredEquipes([]);
      setFormData(prev => ({ ...prev, equipe: "" }));
    }
  }, [formData.zone, equipes]);

  // Calculer dateLong automatiquement
  useEffect(() => {
    const dateAlerte = formData.dateHeureAlerte;
    const dateIntervention = formData.dateHeureIntervention;
    
    let dateLong = "";
    if (dateAlerte) {
      dateLong = dateAlerte;
    } else if (dateIntervention) {
      dateLong = dateIntervention;
    }
    
    if (dateLong && dateLong !== formData.dateLong) {
      setFormData(prev => ({ ...prev, dateLong }));
    }
  }, [formData.dateHeureAlerte, formData.dateHeureIntervention]);

  const fetchUserProfile = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    }
  };

  const fetchCollections = async () => {
    try {
      // Fetch zones
      const zonesSnapshot = await getDocs(collection(db, "zones"));
      const zonesList = zonesSnapshot.docs.map((doc) => ({
        id: doc.id,
        nomZone: doc.data().nomZone,
      }));
      setZones(zonesList.sort((a, b) => a.nomZone.localeCompare(b.nomZone)));

      // Fetch lieux
      const lieuxSnapshot = await getDocs(collection(db, "lieux"));
      const lieuxList = lieuxSnapshot.docs.map((doc) => ({
        id: doc.id,
        nomLieu: doc.data().nomLieu,
        zone: doc.data().zone,
      }));
      setLieux(lieuxList.sort((a, b) => a.nomLieu.localeCompare(b.nomLieu)));

      // Fetch equipes
      const equipesSnapshot = await getDocs(collection(db, "equipes"));
      const equipesList = equipesSnapshot.docs.map((doc) => ({
        id: doc.id,
        nomEquipe: doc.data().nomEquipe,
        zone: doc.data().zone,
      }));
      setEquipes(equipesList.sort((a, b) => a.nomEquipe.localeCompare(b.nomEquipe)));

      // Fetch motifs saisie
      const motifsSnapshot = await getDocs(collection(db, "motifSaisie"));
      const motifsList = motifsSnapshot.docs.map((doc) => ({
        id: doc.id,
        motif: doc.data().motif,
      }));
      setMotifsSaisie(motifsList.sort((a, b) => a.motif.localeCompare(b.motif)));

      // Fetch personnels
      const personnelsSnapshot = await getDocs(collection(db, "personnels"));
      const personnelsList = personnelsSnapshot.docs.map((doc) => ({
        id: doc.id,
        nomPrenom: doc.data().nomPrenom,
        matricule: doc.data().matricule,
      }));
      setPersonnels(personnelsList.sort((a, b) => a.nomPrenom.localeCompare(b.nomPrenom)));

      // Fetch entreprises
      const entreprisesSnapshot = await getDocs(collection(db, "entreprise"));
      const entreprisesList = entreprisesSnapshot.docs.map((doc) => ({
        id: doc.id,
        nomEntreprise: doc.data().nomEntreprise,
      }));
      setEntreprises(entreprisesList.sort((a, b) => a.nomEntreprise.localeCompare(b.nomEntreprise)));

    } catch (error) {
      console.error("Erreur lors du chargement des collections:", error);
    }
  };

  const loadIndividuData = async () => {
    try {
      const individuDoc = await getDoc(doc(db, "individusInterpelles", individuId));
      if (individuDoc.exists()) {
        const data = individuDoc.data();
        setFormData({
          ...data,
          dateHeureAlerte: data.dateHeureAlerte || "",
          dateHeureIntervention: data.dateHeureIntervention || "",
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'individu:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddIntervenant = () => {
    if (!selectedPersonnel) {
      setMatriculeValidation("Veuillez sélectionner un personnel");
      return;
    }

    if (formData.intervenants.includes(selectedPersonnel)) {
      setMatriculeValidation("Ce personnel est déjà dans la liste");
      return;
    }

    setFormData(prev => ({
      ...prev,
      intervenants: [...prev.intervenants, selectedPersonnel]
    }));
    setSelectedPersonnel("");
    setMatriculeValidation("");
  };

  const handleRemoveIntervenant = (personnelId) => {
    setFormData(prev => ({
      ...prev,
      intervenants: prev.intervenants.filter(id => id !== personnelId)
    }));
  };

  const getPersonnelName = (personnelId) => {
    const personnel = personnels.find(p => p.id === personnelId);
    return personnel ? `${personnel.nomPrenom} (${personnel.matricule})` : personnelId;
  };

  const validateForm = () => {
    const requiredFields = ['vacation', 'zone', 'lieu', 'equipe', 'motif'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Veuillez remplir les champs obligatoires: ${missingFields.join(', ')}`);
      return false;
    }

    // Validation des dates
    if (formData.dateHeureAlerte && formData.dateHeureIntervention) {
      const dateAlerte = new Date(formData.dateHeureAlerte);
      const dateIntervention = new Date(formData.dateHeureIntervention);
      
      if (dateAlerte > dateIntervention) {
        setError("La date/heure d'alerte doit être antérieure ou égale à la date/heure d'intervention");
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const individuData = {
        ...formData,
        primoIntervenant: showEntrepriseInput ? customEntreprise : formData.primoIntervenant,
      };

      if (isEditMode) {
        await setDoc(doc(db, "individusInterpelles", individuId), individuData, { merge: true });
      } else {
        await setDoc(doc(db, "individusInterpelles", `individu_${Date.now()}`), individuData);
      }

      onClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      setError("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto py-8"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl border border-gray-100 animate-scale-in mx-4 my-8">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {isEditMode ? "Modifier l'individu interpellé" : "Nouvel individu interpellé"}
                </h2>
                <p className="text-blue-200 text-xs">
                  {isEditMode ? "Mettre à jour les informations" : "Créer un nouveau enregistrement"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors duration-200 cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date/Heure Alerte */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-gray-100 rounded">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Date/Heure Alerte</span>
                </label>
                <input
                  type="datetime-local"
                  name="dateHeureAlerte"
                  value={formData.dateHeureAlerte}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                />
              </div>

              {/* Vacation */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-gray-100 rounded">
                    <Clock className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Vacation *</span>
                </label>
                <select
                  name="vacation"
                  value={formData.vacation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                >
                  <option value="">Sélectionner une vacation</option>
                  <option value="Jour">Jour</option>
                  <option value="Nuit">Nuit</option>
                </select>
              </div>

              {/* Zone */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-gray-100 rounded">
                    <MapPin className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Zone *</span>
                </label>
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                >
                  <option value="">Sélectionner une zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.nomZone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lieu */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-gray-100 rounded">
                    <MapPin className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Lieu *</span>
                </label>
                <select
                  name="lieu"
                  value={formData.lieu}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                  disabled={!formData.zone}
                >
                  <option value="">Sélectionner un lieu</option>
                  {filteredLieux.map((lieu) => (
                    <option key={lieu.id} value={lieu.id}>
                      {lieu.nomLieu}
                    </option>
                  ))}
                </select>
              </div>

              {/* Équipe */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-gray-100 rounded">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Équipe *</span>
                </label>
                <select
                  name="equipe"
                  value={formData.equipe}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                  disabled={!formData.zone}
                >
                  <option value="">Sélectionner une équipe</option>
                  {filteredEquipes.map((equipe) => (
                    <option key={equipe.id} value={equipe.id}>
                      {equipe.nomEquipe}
                    </option>
                  ))}
                </select>
              </div>

              {/* Motif */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-gray-100 rounded">
                    <Shield className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Motif *</span>
                </label>
                <select
                  name="motif"
                  value={formData.motif}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                >
                  <option value="">Sélectionner un motif</option>
                  {motifsSaisie.map((motif) => (
                    <option key={motif.id} value={motif.id}>
                      {motif.motif}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nom Individu */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-gray-100 rounded">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Nom Individu</span>
                </label>
                <input
                  type="text"
                  name="nomIndividu"
                  value={formData.nomIndividu}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  placeholder="Nom de l'individu interpellé"
                />
              </div>

              {/* Primo Intervenant */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-gray-100 rounded">
                    <Building className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Primo Intervenant</span>
                </label>
                {!showEntrepriseInput ? (
                  <div className="flex items-center space-x-2">
                    <input
                      list="entreprises-list"
                      name="primoIntervenant"
                      value={formData.primoIntervenant}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                      placeholder="Saisir ou sélectionner une entreprise"
                    />
                    <datalist id="entreprises-list">
                      <option value="ISP" />
                      {entreprises.map((entreprise) => (
                        <option key={entreprise.id} value={entreprise.nomEntreprise} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      onClick={() => setShowEntrepriseInput(true)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={customEntreprise}
                      onChange={(e) => setCustomEntreprise(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                      placeholder="Nom de l'entreprise"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowEntrepriseInput(false);
                        setCustomEntreprise("");
                        setFormData(prev => ({ ...prev, primoIntervenant: "" }));
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Date/Heure Intervention */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <div className="p-1 bg-gray-100 rounded">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Date/Heure Intervention</span>
                </label>
                <input
                  type="datetime-local"
                  name="dateHeureIntervention"
                  value={formData.dateHeureIntervention}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                />
              </div>

              {/* Validation (visible seulement pour admin/superviseur) */}
              {(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <span>État de validation</span>
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, valider: !prev.valider }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                        formData.valider ? "bg-green-600" : "bg-gray-400"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          formData.valider ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-medium ${
                      formData.valider ? "text-green-700" : "text-gray-700"
                    }`}>
                      {formData.valider ? "Individu validé" : "Individu non validé"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Intervenants */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Intervenants</h3>
              </div>

              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sélectionner un personnel
                  </label>
                  <select
                    value={selectedPersonnel}
                    onChange={(e) => {
                      setSelectedPersonnel(e.target.value);
                      setMatriculeValidation("");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  >
                    <option value="">Choisir un personnel</option>
                    {personnels.map((personnel) => (
                      <option key={personnel.id} value={personnel.id}>
                        {personnel.nomPrenom} ({personnel.matricule})
                      </option>
                    ))}
                  </select>
                  {matriculeValidation && (
                    <p className="text-red-500 text-xs mt-1">
                      {matriculeValidation}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddIntervenant}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-200 text-sm flex items-center space-x-1 cursor-pointer"
                  style={{borderRadius: '50px', color: 'white'}}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.border = '1px solid #2563eb';
                    e.target.style.color = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '';
                    e.target.style.border = '';
                    e.target.style.color = 'white';
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {formData.intervenants.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">Intervenants ajoutés :</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.intervenants.map((personnelId) => (
                      <div
                        key={personnelId}
                        className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                      >
                        <span>
                          {getPersonnelName(personnelId)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIntervenant(personnelId)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center justify-end space-x-2 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 transition-all duration-200 text-sm cursor-pointer"
                style={{borderRadius: '50px', color: 'white'}}
                onMouseEnter={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.border = '1px solid #6b7280';
                  e.target.style.color = '#6b7280';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '';
                  e.target.style.border = '';
                  e.target.style.color = 'white';
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-700 disabled:from-blue-500 disabled:to-blue-400 transition-all duration-200 text-sm cursor-pointer"
                style={{borderRadius: '50px', color: 'white'}}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = 'transparent';
                    e.target.style.border = '1px solid #1e40af';
                    e.target.style.color = '#1e40af';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = '';
                    e.target.style.border = '';
                    e.target.style.color = 'white';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(-20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </div>
  );
}

export default IndividusInterpellesFormModal;