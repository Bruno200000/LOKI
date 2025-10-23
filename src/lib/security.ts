/**
 * Utilitaires de sécurité et de validation
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class SecurityUtils {
  /**
   * Valide une adresse email
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email) {
      errors.push('L\'email est requis');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Format d\'email invalide');
    } else if (email.length > 254) {
      errors.push('Email trop long (max 254 caractères)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide un mot de passe
   */
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push('Le mot de passe est requis');
    } else {
      if (password.length < 8) {
        errors.push('Le mot de passe doit contenir au moins 8 caractères');
      }
      if (password.length > 128) {
        errors.push('Le mot de passe ne peut pas dépasser 128 caractères');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une minuscule');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une majuscule');
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins un chiffre');
      }
      if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins un caractère spécial');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide un nom complet
   */
  static validateFullName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name) {
      errors.push('Le nom est requis');
    } else if (name.length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    } else if (name.length > 100) {
      errors.push('Le nom ne peut pas dépasser 100 caractères');
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
      errors.push('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide un numéro de téléphone
   */
  static validatePhone(phone: string): ValidationResult {
    const errors: string[] = [];

    if (!phone) {
      return { isValid: true, errors: [] }; // Phone is optional
    }

    if (phone.length < 8) {
      errors.push('Le numéro de téléphone doit contenir au moins 8 chiffres');
    } else if (phone.length > 20) {
      errors.push('Le numéro de téléphone ne peut pas dépasser 20 caractères');
    } else if (!/^[\d\s\-\+\(\)\.]+$/.test(phone)) {
      errors.push('Le numéro de téléphone contient des caractères invalides');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Nettoie et échappe les entrées utilisateur
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .slice(0, 1000); // Limit length
  }

  /**
   * Génère un hash simple pour les sessions (à remplacer par bcrypt en production)
   */
  static hashPassword(password: string): string {
    // En production, utiliser bcrypt ou argon2
    // Pour le moment, on utilise une fonction simple de démonstration
    return btoa(password).slice(0, 32);
  }

  /**
   * Vérifie si une adresse IP est dans une liste de blocage
   */
  static isBlockedIP(ip: string): boolean {
    const blockedIPs = [
      '192.168.1.100', // Exemple d'IP bloquée
      // Ajouter d'autres IPs selon les besoins
    ];

    return blockedIPs.includes(ip);
  }

  /**
   * Rate limiting basique
   */
  private static attempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  static checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    if (now - record.lastAttempt > windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    this.attempts.set(identifier, record);
    return true;
  }

  /**
   * Nettoie les tentatives de connexion anciennes
   */
  static cleanupRateLimit(): void {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes

    for (const [key, record] of this.attempts.entries()) {
      if (now - record.lastAttempt > windowMs) {
        this.attempts.delete(key);
      }
    }
  }
}

/**
 * Middleware de sécurité pour les requêtes HTTP
 */
export class SecurityMiddleware {
  static validateRequest(body: any, requiredFields: string[]): ValidationResult {
    const errors: string[] = [];

    for (const field of requiredFields) {
      if (!body[field]) {
        errors.push(`Le champ ${field} est requis`);
      }
    }

    // Validation XSS basique
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' && /<script|javascript:|on\w+=/i.test(value)) {
        errors.push(`Le champ ${key} contient du code potentiellement malveillant`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static logSecurityEvent(event: string, details: any): void {
    console.warn(`[SECURITY] ${event}:`, details);
    // En production, envoyer vers un service de logging sécurisé
  }
}
