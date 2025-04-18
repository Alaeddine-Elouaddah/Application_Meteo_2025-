// src/components/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRocket,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import OCPLogo from "../assets/ocp.png";

const HomePage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Le nom est requis";
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email invalide";
    }
    if (!formData.message.trim()) errors.message = "Le message est requis";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await fetch("http://localhost:8000/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'envoi du message");
        }

        setSubmitSuccess(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitSuccess(false), 5000);
      } catch (error) {
        console.error("Erreur lors de l'envoi:", error);
        setFormErrors({
          submit:
            "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const features = [
    {
      icon: <FaRocket className="text-blue-500 text-4xl" />,
      title: "Gestion de projets simplifiée",
      description:
        "Organisez et suivez facilement tous vos projets et tâches en un seul endroit.",
    },
    {
      icon: <FaShieldAlt className="text-blue-500 text-4xl" />,
      title: "Sécurité renforcée",
      description:
        "Vos données sont sécurisées avec notre système d'authentification avancé.",
    },
    {
      icon: <FaUsers className="text-blue-500 text-4xl" />,
      title: "Communication en temps réel",
      description:
        "Échangez instantanément avec votre équipe via notre système de chat intégré.",
    },
    {
      icon: <FaChartLine className="text-blue-500 text-4xl" />,
      title: "Analytiques détaillées",
      description:
        "Suivez la progression de vos projets grâce à des tableaux de bord intuitifs.",
    },
  ];

  const testimonials = [
    {
      quote:
        "Cette plateforme a transformé notre productivité. La gestion de projet n'a jamais été aussi simple !",
      author: "Jean Dupont, Directeur Projet",
    },
    {
      quote:
        "La sécurité des données est impeccable et l'interface extrêmement intuitive.",
      author: "Marie Lambert, Responsable IT",
    },
    {
      quote:
        "Les outils de collaboration en temps réel ont révolutionné notre façon de travailler.",
      author: "Ahmed Kassim, Chef d'équipe",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navigation Bar */}
      <motion.nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md py-3" : "bg-transparent py-6"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img src={OCPLogo} alt="Logo" className="h-10" />
            <span className="text-2xl font-bold text-gray-800">
              OCP Plateforme
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-8 items-center">
            <NavLink href="#features">Fonctionnalités</NavLink>
            <NavLink href="#solutions">Solutions</NavLink>
            <NavLink href="#about">À propos</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-2xl focus:outline-none text-gray-800"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          <div className="hidden lg:block">
            <motion.button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Se Connecter
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white text-gray-800 overflow-hidden shadow-lg"
            >
              <div className="container mx-auto px-6 py-4">
                <MobileNavLink
                  href="#features"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Fonctionnalités
                </MobileNavLink>
                <MobileNavLink
                  href="#solutions"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Solutions
                </MobileNavLink>
                <MobileNavLink
                  href="#about"
                  onClick={() => setIsMenuOpen(false)}
                >
                  À propos
                </MobileNavLink>
                <MobileNavLink
                  href="#contact"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </MobileNavLink>
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg mt-4 hover:bg-blue-700 transition-colors"
                >
                  Se Connecter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-40 pb-28 px-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div
              className="lg:w-1/2 mb-12 lg:mb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Boostez votre productivité avec notre{" "}
                <span className="text-blue-600">plateforme OCP</span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 mb-10 max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Une solution complète pour gérer vos projets, collaborer en
                temps réel et suivre vos performances.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <motion.button
                  onClick={() => navigate("/Login")}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Créer un compte <FaArrowRight className="ml-2" />
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl">
                <div className="bg-gray-100 rounded-xl h-80 w-full flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1531973576160-7125cd663d86"
                    alt="Interface de démonstration"
                    className="h-full w-full object-cover rounded-xl"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Notre plateforme offre des outils puissants pour améliorer la
              collaboration et la productivité de vos équipes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Solutions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des solutions adaptées à tous vos besoins professionnels
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Gestion de Projets
                </h3>
                <p className="text-gray-600">
                  Planification, suivi et exécution de tous vos projets en un
                  seul endroit.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Collaboration d'Équipe
                </h3>
                <p className="text-gray-600">
                  Outils de communication et de partage pour une collaboration
                  optimale.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Reporting Analytique
                </h3>
                <p className="text-gray-600">
                  Tableaux de bord et analyses pour suivre vos performances.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              À propos de nous
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez qui nous sommes et notre mission
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978"
                  alt="Équipe OCP travaillant ensemble"
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Notre Mission
              </h3>
              <p className="text-gray-600 mb-6">
                Nous nous engageons à fournir des solutions logicielles
                innovantes qui transforment la façon dont les équipes
                travaillent ensemble. Notre plateforme est conçue pour
                simplifier la collaboration et augmenter la productivité.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Notre Vision
              </h3>
              <p className="text-gray-600">
                Devenir le leader des solutions de collaboration d'équipe en
                offrant une expérience utilisateur exceptionnelle et des
                fonctionnalités puissantes adaptées aux besoins des entreprises
                modernes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nous sommes à votre écoute pour répondre à toutes vos questions
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Contact Info */}
            <motion.div
              className="lg:w-1/3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Informations de contact
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaEnvelope className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Email</h4>
                      <p className="text-gray-600">contact@ocp.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaPhone className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Téléphone</h4>
                      <p className="text-gray-600">+33 1 23 45 67 89</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaMapMarkerAlt className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Adresse</h4>
                      <p className="text-gray-600">
                        123 Rue de la Collaboration, 75000 Paris
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="lg:w-2/3"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                {submitSuccess ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-6 rounded-lg text-center">
                    <h3 className="text-xl font-semibold mb-2">
                      Message envoyé avec succès !
                    </h3>
                    <p>
                      Nous vous répondrons dans les plus brefs délais. Merci.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Nom complet *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            formErrors.name
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                          placeholder="Votre nom"
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            formErrors.email
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          } focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                          placeholder="votre@email.com"
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          formErrors.message
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-300 focus:border-blue-500"
                        } focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                        placeholder="Votre message..."
                      ></textarea>
                      {formErrors.message && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.message}
                        </p>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Envoi en cours...
                        </>
                      ) : (
                        "Envoyer le message"
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Prêt à révolutionner votre façon de travailler ?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-10">
              Rejoignez des milliers d'équipes qui utilisent déjà notre
              plateforme
            </p>
            <motion.button
              onClick={() => navigate("/Login")}
              className="bg-blue-600 text-white px-10 py-4 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              S'inscrire maintenant <FaArrowRight className="ml-3" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <FooterSection
              title="OCP Plateforme"
              content="La solution professionnelle pour la gestion de vos projets et la collaboration d'équipe."
            />
            <FooterLinks
              title="Produit"
              links={[
                { name: "Fonctionnalités", href: "#features" },
                { name: "Solutions", href: "#solutions" },
                { name: "Nouveautés", href: "#updates" },
              ]}
            />
            <FooterLinks
              title="Ressources"
              links={[
                { name: "Documentation", href: "#docs" },
                { name: "FAQ", href: "#faq" },
              ]}
            />
            <FooterLinks
              title="Entreprise"
              links={[
                { name: "À propos", href: "#about" },
                { name: "Contact", href: "#contact" },
              ]}
            />
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>
              © {new Date().getFullYear()} OCP Plateforme. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component abstractions
const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
  >
    {children}
  </a>
);

const MobileNavLink = ({ href, children, onClick }) => (
  <a
    href={href}
    className="block py-3 px-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-800"
    onClick={onClick}
  >
    {children}
  </a>
);

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all h-full"
      whileHover={{ y: -5 }}
    >
      <div className="text-center mb-6">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
        {title}
      </h3>
      <p className="text-gray-600 text-center">{description}</p>
    </motion.div>
  );
};

const FooterSection = ({ title, content }) => {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400">{content}</p>
    </div>
  );
};

const FooterLinks = ({ title, links }) => {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
