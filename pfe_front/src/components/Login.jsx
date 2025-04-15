import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaEnvelope,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import OCPLogo from "../assets/ocp.png";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationStep, setVerificationStep] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [newPasswordStep, setNewPasswordStep] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      verificationCode: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setError("");
    setSuccessMessage("");
    setVerificationStep(false);
    setForgotPassword(false);
    setResetCodeSent(false);
    setNewPasswordStep(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation côté client
    if (!formData.email.trim()) {
      setError("L'adresse email est obligatoire");
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError("Le mot de passe est obligatoire");
      setIsLoading(false);
      return;
    }

    if (!formData.confirmPassword.trim()) {
      setError("Veuillez confirmer votre mot de passe");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (!formData.username.trim()) {
      setError("Le nom d'utilisateur est obligatoire");
      setIsLoading(false);
      return;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Veuillez entrer une adresse email valide");
      setIsLoading(false);
      return;
    }

    // Validation longueur mot de passe
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error(data.message || `Erreur ${response.status}`);
        }
      }

      // Si l'inscription réussit, passer à l'étape de vérification
      setSuccessMessage("Un code de vérification a été envoyé à votre email.");
      setVerificationStep(true);
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError(
          "Impossible de se connecter au serveur. Vérifiez votre connexion."
        );
      } else {
        setError(
          err.message || "Une erreur est survenue lors de l'inscription"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.verificationCode.trim()) {
      setError("Le code de vérification est obligatoire");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/verify-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            code: formData.verificationCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error(data.message || `Erreur ${response.status}`);
        }
      }

      setSuccessMessage("Votre compte a été vérifié avec succès !");
      setTimeout(() => {
        setIsLogin(true);
        setVerificationStep(false);
        setFormData((prev) => ({
          ...prev,
          username: "",
          password: "",
          confirmPassword: "",
          verificationCode: "",
        }));
      }, 2000);
    } catch (err) {
      setError(
        err.message || "Une erreur est survenue lors de la vérification"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation côté client
    if (!formData.email.trim()) {
      setError("L'adresse email est obligatoire");
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError("Le mot de passe est obligatoire");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.verificationRequired) {
          setError("Veuillez vérifier votre email avant de vous connecter");
          setVerificationStep(true);
        } else {
          throw new Error(
            data.error || data.message || "Email ou mot de passe incorrect"
          );
        }
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        navigate("/dashboard"); // Modification ici - redirection vers /dashboard
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(err.message || "Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.email.trim()) {
      setError("Veuillez entrer votre adresse email");
      setIsLoading(false);
      return;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Veuillez entrer une adresse email valide");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error(data.message || `Erreur ${response.status}`);
        }
      }

      setSuccessMessage(
        "Un code de réinitialisation a été envoyé à votre email."
      );
      setResetCodeSent(true);
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError(
          "Impossible de se connecter au serveur. Vérifiez votre connexion."
        );
      } else {
        setError(
          err.message ||
            "Une erreur est survenue lors de l'envoi du code de réinitialisation"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.verificationCode.trim()) {
      setError("Le code de vérification est obligatoire");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/verify-reset-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            code: formData.verificationCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error(data.message || `Erreur ${response.status}`);
        }
      }

      setSuccessMessage(
        "Code vérifié. Veuillez entrer votre nouveau mot de passe."
      );
      setNewPasswordStep(true);
    } catch (err) {
      setError(
        err.message || "Une erreur est survenue lors de la vérification du code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.newPassword.trim()) {
      setError("Le nouveau mot de passe est obligatoire");
      setIsLoading(false);
      return;
    }

    if (!formData.confirmNewPassword.trim()) {
      setError("Veuillez confirmer votre nouveau mot de passe");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            code: formData.verificationCode,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error(data.message || `Erreur ${response.status}`);
        }
      }

      setSuccessMessage("Votre mot de passe a été réinitialisé avec succès !");
      setTimeout(() => {
        setForgotPassword(false);
        setResetCodeSent(false);
        setNewPasswordStep(false);
        setFormData((prev) => ({
          ...prev,
          email: "",
          verificationCode: "",
          newPassword: "",
          confirmNewPassword: "",
        }));
        setIsLogin(true);
      }, 2000);
    } catch (err) {
      setError(
        err.message ||
          "Une erreur est survenue lors de la réinitialisation du mot de passe"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (forgotPassword) {
      if (resetCodeSent) {
        if (newPasswordStep) {
          handleResetPassword(e);
        } else {
          handleVerifyResetCode(e);
        }
      } else {
        handleForgotPassword(e);
      }
    } else if (isLogin) {
      handleLogin(e);
    } else if (verificationStep) {
      handleVerifyCode(e);
    } else {
      handleRegister(e);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-400 to-green-500 px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Logo OCP */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          <img src={OCPLogo} alt="OCP Logo" className="h-16 object-contain" />
        </motion.div>

        {/* Switch between login/register - only show when not in verification step or forgot password */}
        {!verificationStep && !forgotPassword && (
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <div className="relative bg-gray-100 rounded-full p-1 w-64">
              <motion.div
                animate={{
                  x: isLogin ? 0 : "100%",
                  backgroundColor: isLogin ? "#4ade80" : "#22c55e",
                }}
                className="absolute top-0 left-0 w-1/2 h-full rounded-full shadow-md"
              />
              <div className="relative flex z-10">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`w-1/2 py-2 rounded-full text-sm font-medium transition-colors ${
                    isLogin ? "text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Connexion
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`w-1/2 py-2 rounded-full text-sm font-medium transition-colors ${
                    !isLogin
                      ? "text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Inscription
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <h2 className="text-3xl font-bold text-center text-green-600 mb-6">
          {forgotPassword
            ? resetCodeSent
              ? newPasswordStep
                ? "Nouveau mot de passe"
                : "Vérification du code"
              : "Mot de passe oublié"
            : verificationStep
            ? "Vérification du compte"
            : isLogin
            ? "Bienvenue"
            : "Créer un compte"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {forgotPassword ? (
            <>
              {newPasswordStep ? (
                <>
                  <motion.div variants={itemVariants}>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="Nouveau mot de passe"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="pl-10 w-full py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-green-600"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmNewPassword"
                        placeholder="Confirmer le nouveau mot de passe"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        className="pl-10 w-full py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-3 text-gray-400 hover:text-green-600"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </motion.div>
                </>
              ) : resetCodeSent ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center text-gray-600 mb-4"
                  >
                    Un code de réinitialisation a été envoyé à{" "}
                    <span className="font-semibold">{formData.email}</span>.
                    Veuillez l'entrer ci-dessous.
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="relative">
                      <FaCheckCircle className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="verificationCode"
                        placeholder="Code de vérification"
                        value={formData.verificationCode}
                        onChange={handleChange}
                        className="pl-10 w-full py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                        required
                      />
                    </div>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center text-gray-600 mb-4"
                  >
                    Entrez votre adresse email pour recevoir un code de
                    réinitialisation de mot de passe.
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Adresse Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 w-full py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                        required
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </>
          ) : verificationStep ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center text-gray-600 mb-4"
              >
                Un code de vérification a été envoyé à{" "}
                <span className="font-semibold">{formData.email}</span>.
                Veuillez l'entrer ci-dessous.
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="relative">
                  <FaCheckCircle className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="verificationCode"
                    placeholder="Code de vérification"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    className="pl-10 w-full py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                    required
                  />
                </div>
              </motion.div>
            </>
          ) : (
            <>
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <FaUser className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="username"
                        placeholder="Nom d'utilisateur"
                        value={formData.username}
                        onChange={handleChange}
                        className="pl-10 w-full py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                        minLength={3}
                        maxLength={20}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Adresse Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 w-full py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                    required
                  />
                </div>
              </motion.div>

              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 w-full py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-green-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </motion.div>
              )}

              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirmer le mot de passe"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 w-full py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-green-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </motion.div>
              )}

              {isLogin && (
                <motion.div variants={itemVariants}>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 w-full py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-green-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </motion.div>
              )}

              {isLogin && (
                <motion.div
                  variants={itemVariants}
                  className="flex justify-between"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPassword(true);
                      setFormData({
                        ...formData,
                        password: "",
                      });
                    }}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </motion.div>
              )}
            </>
          )}

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold shadow-md transition-all duration-300 flex justify-center items-center disabled:opacity-70"
          >
            {isLoading ? (
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
            ) : forgotPassword ? (
              resetCodeSent ? (
                newPasswordStep ? (
                  "Réinitialiser le mot de passe"
                ) : (
                  "Vérifier le code"
                )
              ) : (
                "Envoyer le code de réinitialisation"
              )
            ) : verificationStep ? (
              "Vérifier le code"
            ) : isLogin ? (
              "Se connecter"
            ) : (
              "S'inscrire"
            )}
          </motion.button>

          {/* Message d'erreur */}
          <AnimatePresence>
            {(error || successMessage) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-lg text-sm text-center flex items-center justify-center ${
                  error
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error || successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {!verificationStep && !forgotPassword && (
            <motion.div
              variants={itemVariants}
              className="mt-6 text-center text-sm text-gray-500"
            >
              {isLogin ? "Nouveau chez OCP ?" : "Déjà membre ?"}{" "}
              <button
                onClick={toggleMode}
                className="text-green-600 font-medium hover:text-green-800 hover:underline focus:outline-none transition-colors"
              >
                {isLogin ? "Créer un compte" : "Se connecter"}
              </button>
            </motion.div>
          )}

          {(verificationStep || forgotPassword) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center text-sm text-gray-500"
            >
              <button
                onClick={() => {
                  if (forgotPassword) {
                    if (newPasswordStep) {
                      setNewPasswordStep(false);
                    } else if (resetCodeSent) {
                      setResetCodeSent(false);
                    } else {
                      setForgotPassword(false);
                    }
                  } else {
                    setVerificationStep(false);
                  }
                }}
                className="text-green-600 font-medium hover:text-green-800 hover:underline focus:outline-none transition-colors"
              >
                {forgotPassword
                  ? newPasswordStep
                    ? "Retour à la vérification"
                    : resetCodeSent
                    ? "Retour"
                    : "Retour à la connexion"
                  : "Retour à l'inscription"}
              </button>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
