import { describe, it, expect, beforeEach } from 'vitest';
import { 
  jobSchema, 
  jobUpdateSchema, 
  filtersSchema, 
  resumeSchema,
  searchSchema,
  validate 
} from '../src/utils/validation.js';

describe('Job Validation', () => {
  it('should validate a valid job', () => {
    const job = {
      title: 'Software Engineer',
      company: 'SAP',
      platform: 'LinkedIn',
      location: 'Berlin',
      status: 'found'
    };
    
    const { error } = jobSchema.validate(job);
    expect(error).toBeUndefined();
  });
  
  it('should reject job without required fields', () => {
    const job = {
      title: 'Software Engineer'
      // missing company and platform
    };
    
    const { error } = jobSchema.validate(job);
    expect(error).toBeDefined();
    expect(error.details.length).toBe(2);
  });
  
  it('should reject invalid status', () => {
    const job = {
      title: 'Software Engineer',
      company: 'SAP',
      platform: 'LinkedIn',
      status: 'invalid_status'
    };
    
    const { error } = jobSchema.validate(job);
    expect(error).toBeDefined();
  });
  
  it('should reject title too long', () => {
    const job = {
      title: 'a'.repeat(201), // 201 chars
      company: 'SAP',
      platform: 'LinkedIn'
    };
    
    const { error } = jobSchema.validate(job);
    expect(error).toBeDefined();
  });
});

describe('Search Validation', () => {
  it('should validate valid search', () => {
    const search = {
      keywords: 'Python Developer',
      location: 'Berlin'
    };
    
    const { error, value } = searchSchema.validate(search);
    expect(error).toBeUndefined();
    expect(value.location).toBe('Berlin');
  });
  
  it('should use default location', () => {
    const search = {
      keywords: 'Python Developer'
    };
    
    const { value } = searchSchema.validate(search);
    expect(value.location).toBe('Germany');
  });
  
  it('should reject empty keywords', () => {
    const search = {
      keywords: ''
    };
    
    const { error } = searchSchema.validate(search);
    expect(error).toBeDefined();
  });
  
  it('should validate platform', () => {
    const search = {
      keywords: 'Python',
      platform: 'linkedin'
    };
    
    const { error } = searchSchema.validate(search);
    expect(error).toBeUndefined();
  });
  
  it('should reject invalid platform', () => {
    const search = {
      keywords: 'Python',
      platform: 'invalid'
    };
    
    const { error } = searchSchema.validate(search);
    expect(error).toBeDefined();
  });
});

describe('Resume Validation', () => {
  it('should validate valid resume', () => {
    const resume = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+49123456789',
      skills: ['JavaScript', 'React']
    };
    
    const { error } = resumeSchema.validate(resume);
    expect(error).toBeUndefined();
  });
  
  it('should reject invalid email', () => {
    const resume = {
      name: 'John',
      email: 'not-an-email'
    };
    
    const { error } = resumeSchema.validate(resume);
    expect(error).toBeDefined();
  });
  
  it('should allow optional fields', () => {
    const resume = {
      name: 'John Doe'
      // all other fields optional
    };
    
    const { error } = resumeSchema.validate(resume);
    expect(error).toBeUndefined();
  });
});

describe('Filters Validation', () => {
  it('should validate valid filters', () => {
    const filters = {
      keywords: ['Python', 'JavaScript'],
      locations: ['Berlin', 'Munich'],
      salaryMin: 50000,
      requireVisa: false,
      blacklistCompanies: ['BadCompany']
    };
    
    const { error } = filtersSchema.validate(filters);
    expect(error).toBeUndefined();
  });
  
  it('should reject negative salary', () => {
    const filters = {
      salaryMin: -1000
    };
    
    const { error } = filtersSchema.validate(filters);
    expect(error).toBeDefined();
  });
});

describe('Validate Middleware', () => {
  it('should call next on valid data', () => {
    const middleware = validate(jobSchema);
    const req = { body: { title: 'Test', company: 'Test Co', platform: 'LinkedIn' } };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    
    middleware(req, res, next);
    expect(nextCalled).toBe(true);
    expect(req.validatedBody).toBeDefined();
  });
  
  it('should return 400 on invalid data', () => {
    const middleware = validate(jobSchema);
    const req = { body: {} };
    const res = {
      status: () => res,
      json: (data) => {
        expect(data.error).toBe('Validation failed');
        expect(data.details).toBeDefined();
      }
    };
    
    middleware(req, res, () => {});
  });
});
