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
  FileText,
  X,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  Save,
  Loader2,
  Building,
  User,
  Hash,
  CheckCircle,
  XCircle,
} from "lucide-react";

function DocumentsSaisisFormModal({ isOpen, onClose, documentId, isEditMode }) {
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);

  const [formData, setFormData] = useState({
    reference: "",
    date: new Date().toISOString().split("T")[0],
    heure: new Date().toTimeString().slice(0, 5),
    vacation: "jour",
    zone: "",
    lieu: "",
    equipe: "",
    TypeUsager: "",
    motifSaisie: "",
    typeDocument: "",
    Entreprise: "",
    nomUsager: "",
    intervenants: [],
    enregistrePar: "",
    dateEnregistrement: new Date().toISOString(),
    dateLong: "",
    valider: false,
  });

  const [zones, setZones] = useState([]);
  const [lieux, setLieux] = useState([]);
  const [filteredLieux, setFilteredLieux] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [filteredEquipes, setFilteredEquipes] = useState([]);
  const [usagers, setUsagers] = useState([]);
  const [motifsSaisie, setMotifsSaisie] = useState([]);
  const [typesDocument, setTypesDocument] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // États pour les ajouts dynamiques d'intervenants
  const [newMatricule, setNewMatricule] = useState("");
  const [matriculeValidation, setMatriculeValidation] = useState("");

  // États pour l'entreprise avec saisie libre
  const [showEntrepriseInput, setShowEntrepriseInput] = useState(false);
  const [customEntreprise, setCustomEntreprise] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          setFormData(prev => ({ ...prev, enregistrePar: user.uid }));
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchAllData();
      if (isEditMode && documentId) {
        fetchDocumentData();
      }
    }
  }, [isOpen, isEditMode, documentId]);

  const fetchAllData = async () => {
    try {
      const [
        zonesSnapshot,
        lieuxSnapshot,
        equipesSnapshot,
        usagersSnapshot,
        motifsSnapshot,
        typesSnapshot,
        entreprisesSnapshot,
        personnelsSnapshot,
      ] = await Promise.all([
        getDocs(query(collection(db, "zones"), where("active", "==", true))),
        getDocs(query(collection(db, "lieux"), where("active", "==", true))),
        getDocs(query(collection(db, "equipes"), where("active", "==", true))),
        getDocs(collection(db, "usagers")),
        getDocs(collection(db, "motifSaisie")),
        getDocs(collection(db, "typeDocument")),
        getDocs(query(collection(db, "entreprise"), where("active", "==", true))),
        getDocs(query(collection(db, "personnels"), where("active", "==", true))),
      ]);

      setZones(zonesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLieux(lieuxSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setEquipes(equipesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const usagersData = usagersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Données usagers récupérées:", usagersData);
      setUsagers(usagersData);
      const motifsData = motifsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Données motifs récupérées:", motifsData);
      setMotifsSaisie(motifsData);
      setTypesDocument(typesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setEntreprises(entreprisesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setPersonnels(personnelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setError("Erreur lors du chargement des données");
    }
  };

  const fetchDocumentData = async () => {
    try {
      const documentDoc = await getDoc(doc(db, "documentsSaisis", documentId));
      if (documentDoc.exists()) {
        const data = documentDoc.data();
        setFormData({
          ...data,
          date: data.date || new Date().toISOString().split("T")[0],
          heure: data.heure || new Date().toTimeString().slice(0, 5),
          valider: data.valider || false,
        });
        
        // Si c'est une entreprise personnalisée, l'afficher
        if (data.Entreprise && !entreprises.find(e => e.nomEntreprise === data.Entreprise)) {
          setShowEntrepriseInput(true);
          setCustomEntreprise(data.Entreprise);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du document:", error);
      setError("Erreur lors du chargement du document");
    }
  };

  // Filtrer les lieux selon la zone sélectionnée
  useEffect(() => {
    if (formData.zone) {
      const filtered = lieux.filter(lieu => lieu.zone === formData.zone);
      setFilteredLieux(filtered);
      if (formData.lieu && !filtered.find(l => l.id === formData.lieu)) {
        setFormData(prev => ({ ...prev, lieu: "" }));
      }
    } else {
      setFilteredLieux([]);
    }
  }, [formData.zone, lieux]);

  // Filtrer les équipes selon la zone sélectionnée
  useEffect(() => {
    if (formData.zone) {
      const filtered = equipes.filter(equipe => equipe.zone === formData.zone);
      setFilteredEquipes(filtered);
      if (formData.equipe && !filtered.find(e => e.id === formData.equipe)) {
        setFormData(prev => ({ ...prev, equipe: "" }));
      }
    } else {
      setFilteredEquipes([]);
    }
  }, [formData.zone, equipes]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddIntervenant = () => {
    if (!newMatricule.trim()) {
      setMatriculeValidation("Veuillez saisir un matricule");
      return;
    }

    const personnel = personnels.find(p => p.matricule === newMatricule.trim());
    if (!personnel) {
      setMatriculeValidation("Matricule non trouvé dans la base de données");
      return;
    }

    if (formData.intervenants.includes(personnel.id)) {
      setMatriculeValidation("Ce personnel est déjà dans la liste");
      return;
    }

    setFormData(prev => ({
      ...prev,
      intervenants: [...prev.intervenants, personnel.id]
    }));
    setNewMatricule("");
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

  const handleMatriculeChange = (e) => {
    const value = e.target.value;
    setNewMatricule(value);
    
    if (value.trim()) {
      const personnel = personnels.find(p => p.matricule === value.trim());
      if (personnel) {
        setMatriculeValidation(`✓ ${personnel.nomPrenom}`);
      } else {
        setMatriculeValidation("Matricule non trouvé");
      }
    } else {
      setMatriculeValidation("");
    }
  };

  const handleEntrepriseChange = (e) => {
    const value = e.target.value;
    if (value === "custom") {
      setShowEntrepriseInput(true);
      setFormData(prev => ({ ...prev, Entreprise: "" }));
    } else {
      setShowEntrepriseInput(false);
      setCustomEntreprise("");
      setFormData(prev => ({ ...prev, Entreprise: value }));
    }
  };

  const handleCustomEntrepriseChange = (e) => {
    const value = e.target.value;
    setCustomEntreprise(value);
    setFormData(prev => ({ ...prev, Entreprise: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Construire dateLong
      const dateLong = new Date(`${formData.date}T${formData.heure}`).toISOString();

      const documentData = {
        ...formData,
        dateLong,
        dateEnregistrement: isEditMode ? formData.dateEnregistrement : new Date().toISOString(),
        enregistrePar: isEditMode ? formData.enregistrePar : user.uid,
      };

      const documentRef = doc(
        db,
        "documentsSaisis",
        isEditMode ? documentId : doc(collection(db, "documentsSaisis")).id
      );

      await setDoc(documentRef, documentData, { merge: true });
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      setError("Erreur lors de l'enregistrement: " + error.message);
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
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {isEditMode ? "Modifier le document saisi" : "Nouveau document saisi"}
                </h2>
                <p className="text-blue-200 text-xs">
                  {isEditMode ? "Mettre à jour les informations" : "Créer un nouveau document saisi"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Référence */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Hash className="w-3 h-3" />
                  <span>Référence</span>
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  placeholder="Référence du document"
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Calendar className="w-3 h-3" />
                  <span>Date <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                />
              </div>

              {/* Heure */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Clock className="w-3 h-3" />
                  <span>Heure <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="time"
                  name="heure"
                  value={formData.heure}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                />
              </div>

              {/* Vacation */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Shield className="w-3 h-3" />
                  <span>Vacation <span className="text-red-500">*</span></span>
                </label>
                <select
                  name="vacation"
                  value={formData.vacation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                >
                  <option value="jour">Jour</option>
                  <option value="nuit">Nuit</option>
                </select>
              </div>

              {/* Zone */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <MapPin className="w-3 h-3" />
                  <span>Zone <span className="text-red-500">*</span></span>
                </label>
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                >
                  <option value="">Sélectionner une zone</option>
                  {zones.sort((a, b) => (a.nomZone || '').localeCompare(b.nomZone || '')).map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.nomZone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lieu */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <MapPin className="w-3 h-3" />
                  <span>Lieu <span className="text-red-500">*</span></span>
                </label>
                <select
                  name="lieu"
                  value={formData.lieu}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                  disabled={!formData.zone}
                >
                  <option value="">Sélectionner un lieu</option>
                  {filteredLieux.sort((a, b) => (a.nomLieu || '').localeCompare(b.nomLieu || '')).map((lieu) => (
                    <option key={lieu.id} value={lieu.id}>
                      {lieu.nomLieu}
                    </option>
                  ))}
                </select>
              </div>

              {/* Équipe */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Users className="w-3 h-3" />
                  <span>Équipe <span className="text-red-500">*</span></span>
                </label>
                <select
                  name="equipe"
                  value={formData.equipe}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                  disabled={!formData.zone}
                >
                  <option value="">Sélectionner une équipe</option>
                  {filteredEquipes.sort((a, b) => (a.nomEquipe || '').localeCompare(b.nomEquipe || '')).map((equipe) => (
                    <option key={equipe.id} value={equipe.id}>
                      {equipe.nomEquipe}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Usager */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <User className="w-3 h-3" />
                  <span>Type Usager <span className="text-red-500">*</span></span>
                </label>
                <select
                  name="TypeUsager"
                  value={formData.TypeUsager}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                >
                  <option value="">Sélectionner un type d'usager</option>
                  {usagers.sort((a, b) => {
                    const nameA = a.nomUsagers || a.nomUsager || a.nom || a.id;
                    const nameB = b.nomUsagers || b.nomUsager || b.nom || b.id;
                    return nameA.localeCompare(nameB);
                  }).map((usager) => (
                    <option key={usager.id} value={usager.id}>
                      {usager.nomUsagers || usager.nomUsager || usager.nom || usager.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Motif Saisie */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Shield className="w-3 h-3" />
                  <span>Motif Saisie <span className="text-red-500">*</span></span>
                </label>
                <select
                  name="motifSaisie"
                  value={formData.motifSaisie}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                >
                  <option value="">Sélectionner un motif</option>
                  {motifsSaisie.sort((a, b) => {
                    const nameA = a.nomMotif || a.nom || a.motif || a.id;
                    const nameB = b.nomMotif || b.nom || b.motif || b.id;
                    return nameA.localeCompare(nameB);
                  }).map((motif) => (
                    <option key={motif.id} value={motif.id}>
                      {motif.nomMotif || motif.nom || motif.motif || motif.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Document */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <FileText className="w-3 h-3" />
                  <span>Type Document <span className="text-red-500">*</span></span>
                </label>
                <select
                  name="typeDocument"
                  value={formData.typeDocument}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                >
                  <option value="">Sélectionner un type de document</option>
                  {typesDocument.sort((a, b) => (a.nomDocument || '').localeCompare(b.nomDocument || '')).map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nomDocument}
                    </option>
                  ))}
                </select>
              </div>

              {/* Entreprise */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Building className="w-3 h-3" />
                  <span>Entreprise</span>
                </label>
                {!showEntrepriseInput ? (
                  <select
                    value={formData.Entreprise}
                    onChange={handleEntrepriseChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  >
                    <option value="">Sélectionner une entreprise</option>
                    {entreprises.sort((a, b) => (a.nomEntreprise || '').localeCompare(b.nomEntreprise || '')).map((entreprise) => (
                      <option key={entreprise.id} value={entreprise.nomEntreprise}>
                        {entreprise.nomEntreprise}
                      </option>
                    ))}
                    <option value="custom">Autre (saisie libre)</option>
                  </select>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customEntreprise}
                      onChange={handleCustomEntrepriseChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                      placeholder="Nom de l'entreprise"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowEntrepriseInput(false);
                        setCustomEntreprise("");
                        setFormData(prev => ({ ...prev, Entreprise: "" }));
                      }}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Nom Usager */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <User className="w-3 h-3" />
                  <span>Nom Usager <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  name="nomUsager"
                  value={formData.nomUsager}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  placeholder="Nom de l'usager"
                  required
                />
              </div>

              {/* Validation (visible seulement pour admin/superviseur) */}
              {(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") && (
                <div className="space-y-1">
                  <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>Validation</span>
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
                      {formData.valider ? "Document validé" : "Document non validé"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Section Intervenants */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Intervenants ISP</span>
              </h3>
              
              <div className="flex space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMatricule}
                    onChange={handleMatriculeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                    placeholder="Matricule du personnel"
                  />
                  {matriculeValidation && (
                    <p className={`text-xs mt-1 ${
                      matriculeValidation.startsWith('✓') ? 'text-green-600' : 'text-red-600'
                    }`}>
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
                  <div className="space-y-1">
                    {formData.intervenants.map((personnelId) => (
                      <div
                        key={personnelId}
                        className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg"
                      >
                        <span className="text-sm text-blue-800">
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

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white transition-all duration-200 text-sm cursor-pointer"
                style={{borderRadius: '50px'}}
                onMouseEnter={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.border = '1px solid #6b7280';
                  e.target.style.color = '#6b7280';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '';
                  e.target.style.border = '';
                  e.target.style.color = '';
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

export default DocumentsSaisisFormModal;