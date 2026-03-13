export function getAuthErrorMessage(errorMessage: string) {
  const normalized = errorMessage.toLowerCase();

  if (normalized.includes("database error querying schema")) {
    return "Error interno de autenticacion. Intenta nuevamente en unos minutos.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Correo o contrasena incorrectos.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Debes confirmar tu correo antes de iniciar sesion.";
  }

  if (normalized.includes("user not found")) {
    return "No existe una cuenta con ese correo.";
  }

  if (normalized.includes("password should be at least")) {
    return "La contrasena debe tener al menos 8 caracteres.";
  }

  if (normalized.includes("new password should be different")) {
    return "La nueva contrasena debe ser diferente a la anterior.";
  }

  if (normalized.includes("otp expired") || normalized.includes("token has expired")) {
    return "El enlace expiro. Solicita uno nuevo.";
  }

  return "Ocurrio un error de autenticacion. Intenta nuevamente.";
}
