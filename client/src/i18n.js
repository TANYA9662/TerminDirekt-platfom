import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Ovde dodaj tekstove po jeziku
const resources = {
  en: {
    translation: {
      header: {
        logo: "TerminDirekt",
        register: "Register",
        login: "Login",
        account: "My Account",
        logout: "Logout",
        category: "Category"
      },
      hero: {
        title: "Book an appointment online",
        search_placeholder: "Search companies or services...",
        all_locations: "All locations",
        search_button: "Search",
        popular: {
          massage: "Massage",
          hairdresses: "Hairdresses",
          nails: "Manicure",
          pedicure: "Pedicure",
          lastminut: "Last Minute"
        }
      },
      footer: {
        download: "Download the app",
        appstore: "App Store",
        googleplay: "Google Play",
        account: "Account",
        login: "Login",
        bookings: "My bookings",
        support: "Support",
        info: "Info",
        about: "About us",
        privacy: "Privacy Policy",
        terms: "Terms of service",
        rights: "All rights reserved"
      },
      terms: {
        title: "Terms of Service",
        intro: "Welcome to TerminDirekt. By using our platform, you agree to the following terms.",
        sections: {
          service_desc: "1. Service Description",
          service_desc_text: "TerminDirekt is a platform that allows users to find local services and book appointments...",
          user_account: "2. User Account",
          user_account_text: "Users are responsible for providing accurate information and keeping login credentials safe.",
          booking: "3. Bookings",
          booking_text: "Bookings are made directly between the user and the company. TerminDirekt is not responsible for service quality.",
          cancellation: "4. Cancellation",
          cancellation_text: "Cancellation policies are determined individually by each company. Users should check them before booking.",
          changes: "5. Changes to Terms",
          changes_text: "TerminDirekt reserves the right to modify these terms at any time. The updated version will be published here."
        }
      },
      support: {
        title: "Support",
        contact: "Contact Us",
        form: {
          name: "Name",
          email: "Email",
          message: "Your message",
          submit: "Send Message"
        },
        message_sent: "Your message has been sent. We will contact you soon.",
        faq: "Frequently Asked Questions",
        faq_list: [
          { q: "How to book an appointment?", a: "Select a category, find a company, and choose an available slot for booking." },
          { q: "How to cancel a booking?", a: "In 'My Bookings' you can cancel according to the company's policy." },
          { q: "Is TerminDirekt free to use?", a: "Yes, the platform is completely free for users." }
        ]
      },
      privacy: {
        title: "Privacy Policy",
        intro: "TerminDirekt respects your privacy and is committed to protecting your personal data. This privacy policy explains what data we collect and how we use it.",
        sections: [
          { title: "1. Data We Collect", text: "We may collect basic information such as name, email, and booking details to enable platform use." },
          { title: "2. How We Use Data", text: "Your data is used solely for managing your account, booking appointments, communicating regarding bookings, and improving service." },
          { title: "3. Sharing Data", text: "TerminDirekt does not sell or share your personal data with third parties, except as necessary to fulfill a booking or as required by law." },
          { title: "4. Data Security", text: "We take appropriate technical and organizational measures to protect your data from unauthorized access or misuse." },
          { title: "5. Contact", text: "If you have questions about this policy, contact us at support@termindirekt.com." }
        ]
      },
      about: {
        title: "About TerminDirekt",
        text: "TerminDirekt is a platform that helps users quickly and easily find and book appointments with local services such as hair salons, massages, spa centers, and more.",
        more: "Our goal is to simplify the booking process and connect users with quality local companies."
      },

      home: {
        must_login: "You must be logged in to book",
        booking_success: "Booking successfully created!",
        booking_error: "Error creating booking",
        only_users_booking: "Only regular users can book",
        no_companies: "No companies to show",
        login_to_book: "Please login to book",
        login: "Login",
        cancel: "Cancel"
      },
      companyCard: {
        no_reviews: "No reviews",
        book_button: "Book"
      },
      categoryPage: {
        loading: "Loading...",
        category_not_found: "Category not found",
        search_placeholder: "Search companies or services..."
      },
      booking: {
        services_and_prices: "Services and Prices",
        minutes: "min",
        available_slots: "Available Slots",
        no_available_slots: "No available slots",
        cancel: "Cancel",
        book_now: "Book Now"
      },
      auth: {
        register: "Register",
        login: "Login",
        login_button: "Log in",
        logging_in: "Logging in...",
        forgot_password: "Forgot password?",
        company: "Company",
        user: "User",
        company_name: "Company Name",
        user_name: "User Name",
        city: "City",
        phone: "Phone",
        email: "Email",
        password: "Password",
        register_button: "Register",
        enter_email_password: "Please enter email and password",
        enter_company_name: "Please enter company name",
        register_error: "Error during registration"
      },
      onboarding: {
        welcome: "Welcome",
        company_info: "Company Information",
        company_name: "Company Name",
        company_description: "Company Description",
        city: "City",
        fill_all_fields: "Please fill in all fields",
        error_save: "Error saving company data",
        saving: "Saving...",
        next: "Next",
        back: "Back",
        add_images: "Add Images",
        image_limit: "Invalid image(s) or file too large (max 5MB)",
        add_at_least_one_image: "Please add at least one image",
        images_saved: "Images saved successfully",
        error_saving_images: "Error saving images",
        company: "Company",
        addServices: "Add Services",
        enterNameCategory: "Enter name and category of the service",
        serviceName: "Service Name",
        servicePrice: "Price (RSD)",
        chooseCategory: "Choose Category",
        add: "Add",
        finish: "Finish",
        saveError: "Error saving services.",
        emptyList: "Please add at least one service."
      },
      dashboard: {
        avatar_alt: "Avatar",
        edit_profile: "Edit profile",
        total_bookings: "Total bookings",
        completed: "Completed",
        cancelled: "Cancelled",
        next_appointment: "Next appointment",
        quick_support: "Support",
        quick_settings: "Settings",
        quick_notifications: "Notifications",
        quick_help: "Help",
        my_bookings: "My bookings",
        name: "Name",
        email: "Email",
        phone: "Phone",
        city: "City",
        save: "Save",
        cancel: "Cancel",
        loading: "Loading...",
        access_denied: "Access denied",
        profile_updated: "Profile updated successfully",
        avatar_updated: "Avatar updated successfully",
        error_avatar_upload: "Error uploading avatar",
        error_fetch_bookings: "Error fetching bookings",
        error_profile_update: "Error updating profile",
        confirm_cancel_booking: "Are you sure you want to cancel this booking?",
        booking_cancelled: "Booking cancelled",
        cancel_booking_error: "Error cancelling booking",
        no_bookings: "No bookings"
      },
      companyPage: {
        welcome_message: "Welcome to the best Studio for Beauty!",
        book_slot: "Book appointment",
        services_title: "Services and Prices",
        available_slots: "Available Slots",
        book: "Book",
        cancel: "Cancel",
        reviews: "Reviews",
        rating_label: "Rating",
        rating_input: "Rating (1–5)",
        comment_input: "Comment",
        comment_placeholder: "Leave a comment",
        submit_review: "Send review",
        no_reviews: "No reviews",
        user_default: "User",
        booking_success: "Booking successfully created!",
        booking_error: "Error booking appointment",
        login_required_review: "You must be logged in to leave a review",
        not_found: "Company not found",
        loading: "Loading..."
      },
      companyDashboard: {
        company_info: "Company Information",
        images: "Images",
        services: "Company Services",
        enter_service_name: "Enter service name",
        enter_service_price: "Enter service price",
        select_category: "Select category",
        free: "Free",
        booked: "Booked",
        add_service: "Add service",
        delete: "Delete",
        unknown_service: "Unknown service",
        slots: "Slots",
        select_service: "Select service",
        add_slot: "Add slot",
        save_changes: "Save changes",
        loading: "Loading...",
        company_not_found: "Company not found",
        error_loading_categories: "Error loading categories",
        confirm_delete_image: "Are you sure you want to delete this image?",
        image_deleted: "Image deleted",
        error_delete_image: "Error deleting image",
        enter_service_name_price_category: "Enter service name, price, and category",
        service_added: "Service added",
        service_deleted: "Service deleted",
        fill_all_slot_fields: "Fill all slot fields",
        slot_end_after_start: "Slot end must be after start",
        service_not_found: "Service not found",
        slot_added_temp: "Slot added temporarily",
        slot_deleted: "Slot deleted",
        error_delete_slot: "Error deleting slot",
        all_changes_saved: "All changes saved",
        error_save_changes: "Error saving changes"
      }
    }
  },

  sr: {
    translation: {
      header: {
        logo: "TerminDirekt",
        register: "Registracija",
        login: "Prijavi se",
        account: "Moj nalog",
        logout: "Odjava",
        category: "Kategorija"
      },
      hero: {
        title: "Zakažite termin online",
        search_placeholder: "Pretraži firme ili usluge...",
        all_locations: "Sve lokacije",
        search_button: "Pretraži",
        popular: {
          massage: "Masaža",
          hairdresses: "Frizeri",
          manicure: "Manikir",
          pedicure: "Pedikir",
          lastminute: "Last Minute"
        }
      },
      footer: {
        download: "Preuzmite aplikaciju",
        appstore: "App Store",
        googleplay: "Google Play",
        account: "Korisnički nalog",
        login: "Prijava",
        bookings: "Moje rezervacije",
        support: "Podrška",
        info: "Info",
        about: "O nama",
        privacy: "Politika privatnosti",
        terms: "Uslovi korišćenja",
        rights: " Sva prava zadržana"
      },
      terms: {
        title: "Uslovi korišćenja",
        intro: "Dobrodošli na TerminDirekt. Korišćenjem naše platforme prihvatate sledeće uslove korišćenja.",
        sections: {
          service_desc: "1. Opis usluge",
          service_desc_text: "TerminDirekt je platforma koja omogućava korisnicima da pronađu lokalne usluge i rezervišu termine kod kompanija...",
          user_account: "2. Korisnički nalog",
          user_account_text: "Korisnici su odgovorni za tačnost informacija i čuvanje pristupnih podataka.",
          booking: "3. Rezervacije",
          booking_text: "Rezervacije se obavljaju direktno između korisnika i kompanije. TerminDirekt nije odgovoran za kvalitet usluge.",
          cancellation: "4. Otkazivanje",
          cancellation_text: "Pravila otkazivanja određuje svaka kompanija. Korisnici treba da proverе uslove pre rezervacije.",
          changes: "5. Izmene uslova",
          changes_text: "TerminDirekt zadržava pravo da izmeni ove uslove u bilo kom trenutku. Ažurirana verzija će biti objavljena na ovoj stranici."
        }
      },
      support: {
        title: "Podrška",
        contact: "Kontaktirajte nas",
        form: {
          name: "Ime",
          email: "Email",
          message: "Vaša poruka",
          submit: "Pošalji poruku"
        },
        message_sent: "Poruka je poslata. Kontaktiraćemo vas uskoro.",
        faq: "Često postavljena pitanja",
        faq_list: [
          { q: "Kako rezervisati termin?", a: "Izaberite kategoriju, pronađite kompaniju i izaberite slobodan termin za rezervaciju." },
          { q: "Kako otkazati rezervaciju?", a: "U sekciji 'Moje rezervacije' možete otkazati termin u skladu sa pravilima kompanije." },
          { q: "Da li je korišćenje TerminDirekt besplatno?", a: "Da, za korisnike je korišćenje platforme potpuno besplatno." }
        ]
      },
      privacy: {
        title: "Politika privatnosti",
        intro: "TerminDirekt poštuje vašu privatnost i posvećen je zaštiti vaših ličnih podataka. Ova politika privatnosti objašnjava koje podatke prikupljamo i kako ih koristimo.",
        sections: [
          { title: "1. Podaci koje prikupljamo", text: "Možemo prikupljati osnovne informacije kao što su ime, email adresa i podaci o rezervacijama kako bismo omogućili korišćenje naše platforme." },
          { title: "2. Kako koristimo podatke", text: "Vaše podatke koristimo isključivo za upravljanje korisničkim nalogom, zakazivanje termina, komunikaciju vezanu za rezervacije i unapređenje usluge." },
          { title: "3. Deljenje podataka", text: "TerminDirekt ne prodaje i ne deli vaše lične podatke sa trećim stranama, osim kada je to potrebno za realizaciju rezervacije ili kada to zahteva zakon." },
          { title: "4. Bezbednost podataka", text: "Preduzimamo odgovarajuće tehničke i organizacione mere kako bismo zaštitili vaše podatke od neovlašćenog pristupa ili zloupotrebe." },
          { title: "5. Kontakt", text: "Ako imate pitanja u vezi sa ovom politikom privatnosti, možete nas kontaktirati putem email adrese: support@termindirekt.com" }
        ]
      },
      about: {
        title: "O TerminDirekt",
        text: "TerminDirekt je platforma koja pomaže korisnicima da brzo i jednostavno pronađu i rezervišu termine kod lokalnih usluga kao što su frizerski saloni, masaže, spa centri i druge usluge.",
        more: "Naš cilj je da pojednostavimo proces zakazivanja i povežemo korisnike sa kvalitetnim lokalnim kompanijama."
      },
      home: {
        must_login: "Morate biti ulogovani da biste zakazali termin",
        booking_success: "Rezervacija uspešno kreirana!",
        booking_error: "Greška pri kreiranju rezervacije",
        only_users_booking: "Samo obični korisnici mogu da rezervišu termine",
        no_companies: "Nema firmi za prikaz",
        login_to_book: "Molimo ulogujte se da biste rezervisali termin",
        login: "Ulogujte se",
        cancel: "Otkaži"
      },
      companyCard: {
        no_reviews: "Bez recenzija",
        book_button: "Rezerviši"
      },
      categoryPage: {
        loading: "Učitavanje...",
        category_not_found: "Kategorija nije pronađena",
        search_placeholder: "Pretraži firme ili usluge..."
      },
      booking: {
        services_and_prices: "Usluge i cene",
        minutes: "min",
        available_slots: "Slobodni termini",
        no_available_slots: "Nema slobodnih termina",
        cancel: "Otkaži",
        book_now: "Rezerviši"
      },

      auth: {
        register: "Registracija",
        login: "Prijava",
        login_button: "Prijavi se",
        logging_in: "Prijavljivanje...",
        forgot_password: "Zaboravili ste lozinku?",
        company: "Firma",
        user: "Korisnik",
        company_name: "Naziv firme",
        user_name: "Ime korisnika",
        city: "Grad",
        phone: "Telefon",
        email: "Email",
        password: "Lozinka",
        register_button: "Registruj se",
        enter_email_password: "Morate uneti email i lozinku",
        enter_company_name: "Morate uneti naziv firme",
        register_error: "Greška pri registraciji"


      },
      onboarding: {
        welcome: "Dobrodošli",
        company_info: "Informacije o kompaniji",
        company_name: "Ime kompanije",
        company_description: "Opis kompanije",
        city: "Grad",
        fill_all_fields: "Molimo popunite sva polja",
        error_save: "Greška pri čuvanju podataka",
        saving: "Čuvanje...",
        next: "Dalje",
        back: "Nazad",
        add_images: "Dodajte slike",
        image_limit: "Nevažeća slika ili fajl prevelik (max 5MB)",
        add_at_least_one_image: "Molimo dodajte bar jednu sliku",
        images_saved: "Slike su uspešno sačuvane",
        error_saving_images: "Greška pri čuvanju slika",
        company: "Kompanija",
        addServices: "Dodajte usluge",
        enterNameCategory: "Unesite naziv i kategoriju usluge",
        serviceName: "Naziv usluge",
        servicePrice: "Cena (RSD)",
        chooseCategory: "Izaberite kategoriju",
        add: "Dodaj",
        finish: "Završi",
        saveError: "Greška pri čuvanju usluga.",
        emptyList: "Molimo dodajte bar jednu uslugu."
      },
      dashboard: {
        avatar_alt: "Avatar",
        edit_profile: "Izmeni profil",
        total_bookings: "Ukupno rezervacija",
        completed: "Završene",
        cancelled: "Otkazane",
        next_appointment: "Sledeći termin",
        quick_support: "Podrška",
        quick_settings: "Podešavanja",
        quick_notifications: "Obaveštenja",
        quick_help: "Pomoć",
        my_bookings: "Moje rezervacije",
        name: "Ime",
        email: "Email",
        phone: "Telefon",
        city: "Grad",
        save: "Sačuvaj",
        cancel: "Otkaži",
        loading: "Učitavanje...",
        access_denied: "Pristup odbijen",
        profile_updated: "Profil je uspešno ažuriran",
        avatar_updated: "Avatar je uspešno ažuriran",
        error_avatar_upload: "Greška pri uploadu avatara",
        error_fetch_bookings: "Greška pri učitavanju rezervacija",
        error_profile_update: "Greška pri ažuriranju profila",
        confirm_cancel_booking: "Da li ste sigurni da želite otkazati ovu rezervaciju?",
        booking_cancelled: "Rezervacija je otkazana",
        cancel_booking_error: "Greška pri otkazivanju rezervacije",
        no_bookings: "Nema rezervacija"
      },
      companyPage: {
        welcome_message: "Dobrodošli u najbolji studio za lepotu!",
        book_slot: "Rezerviši termin",
        services_title: "Usluge i cene",
        reviews: "Recenzije",
        rating_label: "Ocena",
        rating_input: "Ocena (1–5)",
        comment_input: "Komentar",
        comment_placeholder: "Ostavite komentar",
        submit_review: "Pošalji recenziju",
        no_reviews: "Nema recenzija",
        user_default: "Korisnik",
        available_slots: "Slobodni termini",
        book: "Rezerviši",
        cancel: "Otkaži",
        booking_success: "Termin uspešno zakazan!",
        booking_error: "Greška pri rezervaciji termina",
        login_required_review: "Morate biti ulogovani da ostavite recenziju",
        not_found: "Firma nije pronađena",
        loading: "Učitavanje..."
      },
      companyDashboard: {
        company_info: "Informacije o firmi",
        images: "Slike",
        services: "Firma Servise",
        enter_service_name: "Unesite naziv usluge",
        enter_service_price: "Unesite cenu usluge",
        select_category: "Izaberite kategoriju",
        free: "Slobodan",
        booked: "Rezervisan",
        add_service: "Dodaj uslugu",
        delete: "Obriši",
        unknown_service: "Nepoznata usluga",
        slots: "Termini",
        select_service: "Izaberite uslugu",
        add_slot: "Dodaj termin",
        save_changes: "Sačuvaj izmene",
        loading: "Učitavanje...",
        company_not_found: "Firma nije pronađena",
        error_loading_categories: "Greška pri učitavanju kategorija",
        confirm_delete_image: "Da li ste sigurni da želite obrisati sliku?",
        image_deleted: "Slika obrisana",
        error_delete_image: "Greška prilikom brisanja slike",
        enter_service_name_price_category: "Unesite naziv, cenu i kategoriju usluge",
        service_added: "Usluga dodata",
        service_deleted: "Usluga obrisana",
        fill_all_slot_fields: "Popunite sva polja termina",
        slot_end_after_start: "Kraj termina mora biti posle početka",
        service_not_found: "Usluga nije pronađena",
        slot_added_temp: "Termin dodat privremeno",
        slot_deleted: "Termin obrisan",
        error_delete_slot: "Greška prilikom brisanja termina",
        all_changes_saved: "Sve izmene sačuvane",
        error_save_changes: "Greška prilikom čuvanja izmena"
      }
    }
  },

  sv: {
    translation: {
      header: {
        logo: "TerminDirekt",
        register: "Registrera ",
        login: "Logga in",
        account: "Mitt konto",
        logout: "Logga ut",
        category: "Kategori"
      },
      hero: {
        title: "Boka tid online",
        search_placeholder: "Sök företag eller tjänster...",
        all_locations: "Alla platser",
        search_button: "Sök",
        popular: {
          massage: "Massage",
          hairdresses: "Frisörer",
          manicure: "Manikyr",
          pedicure: "Pedikyr",
          lastminute: "Sista Minuten"
        }
      },
      footer: {
        download: "Ladda ner appen",
        appstore: "App Store",
        googleplay: "Google Play",
        account: "Konto",
        login: "Logga in",
        bookings: "Mina bokningar",
        support: "Support",
        info: "Info",
        about: "Om oss",
        privacy: "Integritetspolicy",
        terms: "Villkor",
        rights: "Alla rättigheter reserverade"
      },
      terms_sv: {
        title: "Användarvillkor",
        intro: "Välkommen till TerminDirekt. Genom att använda vår plattform accepterar du följande villkor.",
        sections: {
          service_desc: "1. Tjänstbeskrivning",
          service_desc_text: "TerminDirekt är en plattform som gör det möjligt för användare att hitta lokala tjänster och boka tider direkt med företag som använder vårt system.",
          user_account: "2. Användarkonto",
          user_account_text: "Användare är ansvariga för att ange korrekt information vid registrering och för att skydda sina inloggningsuppgifter.",
          booking: "3. Bokningar",
          booking_text: "Bokningar görs direkt mellan användaren och företaget. TerminDirekt ansvarar inte för tjänstens kvalitet som företaget tillhandahåller.",
          cancellation: "4. Avbokning",
          cancellation_text: "Avbokningsregler bestäms individuellt av varje företag. Användare bör kontrollera villkoren innan bokning.",
          changes: "5. Ändringar av villkor",
          changes_text: "TerminDirekt förbehåller sig rätten att ändra dessa villkor när som helst. Den uppdaterade versionen publiceras på denna sida."
        }
      },
      support: {
        title: "Support",
        contact: "Kontakta oss",
        form: {
          name: "Namn",
          email: "Email",
          message: "Ditt meddelande",
          submit: "Skicka meddelande"
        },
        message_sent: "Ditt meddelande har skickats. Vi kontaktar dig snart.",
        faq: "Vanliga frågor",
        faq_list: [
          { q: "Hur bokar man en tid?", a: "Välj kategori, hitta ett företag och välj en ledig tid för bokning." },
          { q: "Hur avbokar man en bokning?", a: "I 'Mina bokningar' kan du avboka enligt företagets policy." },
          { q: "Är TerminDirekt gratis att använda?", a: "Ja, plattformen är helt gratis för användare." }
        ]
      },
      privacy: {
        title: "Integritetspolicy",
        intro: "TerminDirekt respekterar din integritet och är engagerad i att skydda dina personuppgifter. Denna policy förklarar vilka uppgifter vi samlar in och hur vi använder dem.",
        sections: [
          { title: "1. Uppgifter vi samlar in", text: "Vi kan samla in grundläggande information som namn, e-postadress och bokningsinformation för att möjliggöra användning av plattformen." },
          { title: "2. Hur vi använder uppgifter", text: "Vi använder dina uppgifter enbart för att hantera ditt konto, boka tider, kommunicera om bokningar och förbättra tjänsten." },
          { title: "3. Delning av uppgifter", text: "TerminDirekt säljer inte eller delar dina personuppgifter med tredje part, utom när det behövs för att genomföra en bokning eller när lagen kräver det." },
          { title: "4. Datasäkerhet", text: "Vi vidtar lämpliga tekniska och organisatoriska åtgärder för att skydda dina uppgifter från obehörig åtkomst eller missbruk." },
          { title: "5. Kontakt", text: "Om du har frågor om denna policy kan du kontakta oss via e-post: support@termindirekt.com" }
        ]
      },
      about: {
        title: "Om TerminDirekt",
        text: "TerminDirekt är en plattform som hjälper användare att snabbt och enkelt hitta och boka tider hos lokala tjänster som frisörsalonger, massage, spa-center och andra tjänster.",
        more: "Vårt mål är att förenkla bokningsprocessen och koppla användare till kvalitetsföretag lokalt."
      },
      home: {
        must_login: "Du måste vara inloggad för att boka",
        booking_success: "Bokningen skapades!",
        booking_error: "Fel vid bokning",
        only_users_booking: "Endast vanliga användare kan boka",
        no_companies: "Inga företag att visa",
        login_to_book: "Vänligen logga in för att boka",
        login: "Logga in",
        cancel: "Avbryt"
      },
      companyCard: {
        no_reviews: "Inga recensioner",
        book_button: "Boka"
      },
      categoryPage: {
        loading: "Läser...",
        category_not_found: "Kategorin hittades inte",
        search_placeholder: "Sök företag eller tjänster..."
      },
      booking: {
        services_and_prices: "Tjänster och priser",
        minutes: "min",
        available_slots: "Tillgängliga tider",
        no_available_slots: "Inga tillgängliga tider",
        cancel: "Avbryt",
        book_now: "Boka"
      },
      auth: {
        register: "Registrera",
        login: "Logga in",
        login_button: "Logga in",
        logging_in: "Loggar in...",
        forgot_password: "Glömt lösenord?",
        company: "Företag",
        user: "Användare",
        company_name: "Företagsnamn",
        user_name: "Användarnamn",
        city: "Stad",
        phone: "Telefon",
        email: "Email",
        password: "Lösenord",
        register_button: "Registrera",
        enter_email_password: "Ange e-post och lösenord",
        enter_company_name: "Ange företagsnamn",
        register_error: "Fel vid registrering"
      },
      onboarding: {
        welcome: "Välkommen",
        company_info: "Företagsinformation",
        company_name: "Företagsnamn",
        company_description: "Företagsbeskrivning",
        city: "Stad",
        fill_all_fields: "Vänligen fyll i alla fält",
        error_save: "Fel vid sparande av företagsdata",
        saving: "Sparar...",
        next: "Nästa",
        back: "Tillbaka",
        add_images: "Lägg till bilder",
        image_limit: "Ogiltig bild eller fil för stor (max 5MB)",
        add_at_least_one_image: "Vänligen lägg till minst en bild",
        images_saved: "Bilder sparade",
        error_saving_images: "Fel vid sparande av bilder",
        addServices: "Lägg till tjänster",
        enterNameCategory: "Ange namn och kategori för tjänsten",
        serviceName: "Tjänstnamn",
        servicePrice: "Pris (RSD)",
        chooseCategory: "Välj kategori",
        add: "Lägg till",
        finish: "Slutför",
        saveError: "Fel vid sparande av tjänster.",
        emptyList: "Vänligen lägg till minst en tjänst."
      },
      dashboard: {
        avatar_alt: "Avatar",
        edit_profile: "Redigera profil",
        total_bookings: "Totala bokningar",
        completed: "Slutförda",
        cancelled: "Avbokade",
        next_appointment: "Nästa möte",
        quick_support: "Support",
        quick_settings: "Inställningar",
        quick_notifications: "Aviseringar",
        quick_help: "Hjälp",
        my_bookings: "Mina bokningar",
        name: "Namn",
        email: "E-post",
        phone: "Telefon",
        city: "Stad",
        save: "Spara",
        cancel: "Avbryt",
        loading: "Läser in...",
        access_denied: "Åtkomst nekad",
        profile_updated: "Profilen har uppdaterats",
        avatar_updated: "Avatar har uppdaterats",
        error_avatar_upload: "Fel vid uppladdning av avatar",
        error_fetch_bookings: "Fel vid hämtning av bokningar",
        error_profile_update: "Fel vid uppdatering av profil",
        confirm_cancel_booking: "Är du säker på att du vill avboka denna bokning?",
        booking_cancelled: "Bokning avbokad",
        cancel_booking_error: "Fel vid avbokning av bokning",
        no_bookings: "Mina bokningar"
      },
      companyPage: {
        welcome_message: "Välkommen till den bästa studion för skönhet!",
        book_slot: "Boka tid",
        services_title: "Tjänster och priser",
        available_slots: "Tillgängliga tider",
        book: "Boka",
        cancel: "Avbryt",
        reviews: "Recensioner",
        rating_label: "Betyg",
        rating_input: "Betyg (1–5)",
        comment_input: "Kommentar",
        comment_placeholder: "Lämna kommentar",
        submit_review: "Skicka recension",
        no_reviews: "Inga recensioner",
        user_default: "Användare",
        booking_success: "Bokningen skapades!",
        booking_error: "Fel vid bokning",
        login_required_review: "Du måste vara inloggad för att lämna en recension",
        not_found: "Företaget hittades inte",
        loading: "Läser..."
      },
      companyDashboard: {
        company_info: "Företagsinformation",
        images: "Bilder",
        services: "Företag Services",
        enter_service_name: "Ange tjänstens namn",
        enter_service_price: "Ange tjänstens pris",
        select_category: "Välj kategori",
        free: "Ledig",
        booked: "Bokad",
        add_service: "Lägg till tjänst",
        delete: "Radera",
        unknown_service: "Okänd tjänst",
        slots: "Tider",
        select_service: "Välj tjänst",
        add_slot: "Lägg till tid",
        save_changes: "Spara ändringar",
        loading: "Läser...",
        company_not_found: "Företaget hittades inte",
        error_loading_categories: "Fel vid hämtning av kategorier",
        confirm_delete_image: "Är du säker på att du vill radera bilden?",
        image_deleted: "Bild raderad",
        error_delete_image: "Fel vid radering av bild",
        enter_service_name_price_category: "Ange tjänstens namn, pris och kategori",
        service_added: "Tjänst tillagd",
        service_deleted: "Tjänst raderad",
        fill_all_slot_fields: "Fyll i alla tidfält",
        slot_end_after_start: "Sluttiden måste vara efter starttiden",
        service_not_found: "Tjänst hittades inte",
        slot_added_temp: "Tid tillagd tillfälligt",
        slot_deleted: "Tid raderad",
        error_delete_slot: "Fel vid radering av tid",
        all_changes_saved: "Alla ändringar sparade",
        error_save_changes: "Fel vid sparande av ändringar"
      }
    }
  }
};
i18n
  .use(LanguageDetector)  // automatsko detektovanje jezika
  .use(initReactI18next)  // integracija sa React-om
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "sr", "sv"],
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"]
    }
  });


export default i18n;
