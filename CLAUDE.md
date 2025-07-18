on va maintenant créer les composants de la collection incidents dans le dossier /components/data/ (incidentsTable : liste des incidents trié par datelong; incidentForm (qui n'est pas modal))

ce composants permet de renseigner le données de la collection "incidents" qui a les champs suivants

reference : (ne s'affiche pas le formulaire. c'est un champ généré automatiquement selon la logique suivante (date(aaaammjj)+"-"+majuscule(gauche(categorie;3))+"-"+(nombre d'enregistrement du mois en cours + 1 au format "000"); deux enregistrement ne doivent pas avoir la même référence. tenir compte des cas de suppression des incidents parce que le nombre d'incident du mois en cours peut changer. cette référence ne doit pas changer pour les cas de modification. cette référence doit être en majuscule.

date :

heure :

zone : (liste déroulante de la collection zones; affiche nomZone; enregistre id zones)

lieu : (liste deroulante en cascade de la collection lieux selon le champs zone précédent; affiche nomLieu telque zone de la collection lieux = id zones de la valeur correspondant au champ zone de ce formulaire).

precision : type geoposition (egale à la valeur du champ "localisation" de la collection "lieux" qui coorespond à id lieux du champ lieu de ce formulaire par defaut. maintenant l'utilisateur doit avoir la possibilité de modifier cette valeur a partir d'une fenêtre modale qui va s'ouvrir et l'utilisateur devra préciser cette position. cependant la distance entre la position définie par le champ lieu (position par défaut) et la nouvelle precision ne doit pas depasser 200m. la fenêtre modale pour préciser la localisation doit etre bien large et avoir les deux options avec steet view comme pour la selection de la localisation dans le composant /parametre/lieuFormModal.

categorie : (liste deroulante avec les options suivantes : Sécurité; Sureté)

typeIncident : (liste deroulante en cascade de la collection typeIncident selon le champs categorie précédent; affiche les nomIncident telque nomCategorie de la collection typeIncident = la valeur dans le champ categorie de ce formulaire.).

niveauImpact (niveau d'impact : à l'affichage) : (liste déroulante avec les options suivantes : "Négligeable" :en vert ; "Modéré" en jaune; "Majeur" : orange; "Catastrophique" : en rouge)

quantite () : number. ce champs s'affiche sous certaine conditions (si quantite = vrai pour le typeIncident du champ de ce formulaire. allez chercher la valeur du champ typeincident, recuperer id typeIncident qui correspond a cette valeur dans la collection typeIncident. et verifier si le champ quantite = true dans cette collection) \*\*NB : je vois modifier les composant de la collection typeIncident pour ajouter ce champ\*\*

primo (primo intervenant) : (liste deroulante avec les options suivantes : ISP; Extérieur)

intervenantsISP (intervenants ISP) : champ tableau : les valeur du tableau doivent être issues de la collection personnels. dans la pratique ce sont les "id personnels qui doivent être enregistré" qui doivent être enregistré dans ce tableau. il doit avoir un champs en saisie des matricule. a chaque saisie de matricule, indiquer le nom qui correspond à ce matricule. avoir un bouton pour ajouter les personnels au tableau au fur et a mesure. ne pas permettre l'enregistrement du personnel quand le matricule ne fait pas partie de la liste des champs "matricule" de la collection "personnels". l'utilisateur saisie matricule; la vérification doit se faire par le matricule de la collection personnels. créer un système pour rendre cela esthétique et permettre à l'utilisateur d'enregistrer plusieurs personnels ou de retirer des personnel de la liste des personnels.

cameras : champ tableau : les valeurs du tableau doivent être issues de la collection cameras. dans la pratique ce sont les id cameras qui doivent être enregistré dans ce tableau. mais l'utilisateur doit saisir idCamera dans le champ e saisie. il doit avoir des indications au fur et a mesure que la saisie est effectué sur la base des enregistrement dans la collection cameras selon le champ idCamera. ne pas enregistré la cameras quand elle ne fait pas partie de la liste de cameras. l'utilisateur saisie idCamera; la vérification doit se faire par idCamera de la collection cameras. créer un système pour rendre cela esthétique et permettre à l'utilisateur d'enregistrer plusieurs camera ou de retirer des cameras de la liste des cameras.

details : champs en saisie libre. le texte peut être long et sur plusieurs paragraphe et peut avoir des sauts de ligne.

user : enregistrement automatique de id users de l'utilisateur connecté

dateEnreg : date heure d'enregistrement de l'incident

dateLong : date + heure des champs de ce formulaire

mois : "aaaamm" récupérer le mois correspondant à la date pour faciliter les filtres

annee : "aaaa" récupérer l'année correspondant à la date pour faciliter les filtres

supprimer = false par défaut. ne s'affiche pas dans le formulaire ou dans la table. mais permet de rendre visible les enregistrements pour les utilisateur en fonction de leur profil

action (supprimer; modifier (icones uniquement): dans les actions supprimer (ne permet pas de supprimer l'incident mais de modifier le champ : supprimer = false). les actions ne sont pas visibles dans la table qui liste les incidents lorsque pour l'utilisateur connecté "profil" ="user").

dans la table qui liste les incident en fonction du champ "profil" de users . si profil = "user" ou profil = "superviseur"; affiche les enregistrements ou "supprimer" = false. pour les users ou "profil" = "admin" peut voir tous les enregistrements et peut voir la valeur du champ "supprimer" dans la table qui liste les incidents; peut modifier la valeur du champ "supprimer"

dans la table des incidents, les données doivent être triées par dateLong décroissant.

ne pas afficher details dans la table des incidents

pour les valeur de champs trop long prevoir des .... dans la table des incidents

Apres avoir enregistré l'incidents les utilisateurs doivent recevoir un email de l'incident avec les champs détails suivants :

objet : %typeIncident% %lieu%

destinataire : (depend de "emailProfil" de la collection "users" de chaque utilisateur. "niveau1" : recoit tous les emails: "niveau2" recoit les emails quand categorie = sécurité; "niveau3" recoit les email quand niveauImpact = "Catastrophique"); creer la liste des destinataire qui remplissent les conditions

contenu :

REFERENCE : %reference% générée automatiquement

DATE : %date%

HEURE : %heure%

ZONE : %nomZone% de la collection zones à recuperer

LIEU : %nomLieu% de la collection lieux à recuperer

CATEGORIE : %categorie%

TYPE D'INCIDENT : %typeIncident%

NIVEAU D'IMPACT : %niveauImpact%

PRIMO INTERVENANT :%primo%

INTERVENANTS ISP : %nomPrenom% (%matricule%); %nomPrenom% (%matricule%); %nomPrenom% (%matricule%) … en fonction du nombre de personnel enregistré dans le tableau

CAMERAS : %idCameras% ; %idCameras%; %idCameras% … E fonction du nombre d'enregistrement dans la collection Cameras. quand c'est vide ecrire "PAS DE CAMERA"

DETAILS DE L'INCIDENT :

%details%

%nom% a récupérer dans la collection users en fonction de l'utilisateur connecté

%fonction% a récupérer dans la collection users en fonction de l'utilisateur connecté

Bien stylisé tout cela.

pas d'envoi d'email en mode modification.

créer les composant pour afficher modifier, et lister les incidents avec tous en composants necessaires

&nbsp;
