import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        error: 'Validation error',
        details: errors
      });
      return;
    }

    // Replace request body with validated value
    req.body = value;
    next();
  };
};

// Common validation schemas

export const registerSchema = Joi.object({
  email: Joi.string().email().optional(),
  display_name: Joi.string().min(2).max(100).required(),
  family_group_code: Joi.string().length(10).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional() // Password optional for MVP (can use email-only login)
});

export const completeActivitySchema = Joi.object({
  activity_id: Joi.number().integer().positive().required(),
  qr_code: Joi.string().min(10).max(50).required()
});

export const joinQueueSchema = Joi.object({
  station_name: Joi.string().min(3).max(100).required(),
  phone_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
});

export const updateLocationSchema = Joi.object({
  x: Joi.number().min(0).required(),
  y: Joi.number().min(0).required(),
  family_group_id: Joi.number().integer().positive().required()
});

export const createFamilyGroupSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
});

export const joinFamilyGroupSchema = Joi.object({
  invite_code: Joi.string().length(10).required()
});

