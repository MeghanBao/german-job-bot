// Joi validation schemas
import Joi from 'joi';

// Job validation schema
export const jobSchema = Joi.object({
  title: Joi.string().max(200).required(),
  company: Joi.string().max(100).required(),
  platform: Joi.string().max(50).required(),
  location: Joi.string().max(100),
  salary: Joi.string().max(50).allow('', null),
  url: Joi.string().uri().allow('', null),
  status: Joi.string().valid('found', 'applied', 'interview', 'rejected', 'offered', 'pending')
});

// Job update schema
export const jobUpdateSchema = Joi.object({
  title: Joi.string().max(200),
  company: Joi.string().max(100),
  platform: Joi.string().max(50),
  location: Joi.string().max(100),
  salary: Joi.string().max(50).allow('', null),
  url: Joi.string().uri().allow('', null),
  status: Joi.string().valid('found', 'applied', 'interview', 'rejected', 'offered', 'pending')
});

// Filter validation schema
export const filtersSchema = Joi.object({
  keywords: Joi.array().items(Joi.string()),
  locations: Joi.array().items(Joi.string()),
  salaryMin: Joi.number().min(0),
  salaryMax: Joi.number().min(0),
  requireVisa: Joi.boolean(),
  blacklistCompanies: Joi.array().items(Joi.string()),
  whitelistCompanies: Joi.array().items(Joi.string())
});

// Resume validation schema
export const resumeSchema = Joi.object({
  name: Joi.string().max(100),
  email: Joi.string().email().max(100).allow('', null),
  phone: Joi.string().max(20).allow('', null),
  summary: Joi.string().max(2000).allow('', null),
  skills: Joi.array().items(Joi.string())
});

// Search validation schema
export const searchSchema = Joi.object({
  keywords: Joi.string().max(200).required(),
  location: Joi.string().max(100).default('Germany'),
  platform: Joi.string().valid('linkedin', 'indeed', 'stepstone', 'xing', 'jobboerse', 'all')
});

// Answer validation schema
export const answerSchema = Joi.object({
  normalizedKey: Joi.string().required(),
  value: Joi.string().required(),
  text: Joi.string().max(1000).required(),
  label: Joi.string().max(100).required()
});

// Pending question schema
export const pendingQuestionSchema = Joi.object({
  runId: Joi.string(),
  jobId: Joi.string(),
  platform: Joi.string().max(50),
  fieldName: Joi.string().max(100).required(),
  normalizedKey: Joi.string().max(50).required(),
  riskLevel: Joi.string().valid('low', 'medium', 'high').default('medium'),
  suggestedAnswer: Joi.string().max(1000).allow('', null)
});

// Validate middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    req.validatedBody = value;
    next();
  };
};
