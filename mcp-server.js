#!/usr/bin/env node

/**
 * German Job Bot MCP Server
 * 
 * This MCP server exposes German Job Bot functionality as tools
 * that can be used by Claude, Cursor, or any MCP-compatible AI.
 * 
 * Usage:
 *   npm run mcp
 * 
 * Then configure your AI client to connect to this server.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ServerResponseSchema 
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data paths
const dataDir = path.join(__dirname, 'data');
const appliedJsonPath = path.join(dataDir, 'applied.json');
const filtersJsonPath = path.join(dataDir, 'filters.json');
const answersJsonPath = path.join(dataDir, 'answers.json');

// Helper functions
const readJson = (filepath, defaultValue = {}) => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8')) || defaultValue;
  } catch { return defaultValue; }
};

const writeJson = (filepath, data) => {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
};

// Create MCP Server
const server = new Server(
  {
    name: 'german-job-bot',
    version: '1.0.0',
    description: 'AI-powered job application assistant for Germany'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Define available tools
const tools = [
  {
    name: 'search_jobs',
    description: 'Search for jobs in Germany across multiple platforms (LinkedIn, Indeed, StepStone, Xing, Jobbörse)',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: {
          type: 'string',
          description: 'Job title or keywords to search for (e.g., "Python Developer", "Data Scientist")'
        },
        location: {
          type: 'string',
          description: 'Location to search in (default: "Germany")',
          default: 'Germany'
        },
        platform: {
          type: 'string',
          description: 'Specific platform to search on (optional)',
          enum: ['linkedin', 'indeed', 'stepstone', 'xing', 'jobboerse', 'all'],
          default: 'all'
        }
      },
      required: ['keywords']
    }
  },
  {
    name: 'get_jobs',
    description: 'Get all tracked job applications with their status',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status (optional)',
          enum: ['found', 'applied', 'interview', 'rejected', 'offered', 'all'],
          default: 'all'
        }
      }
    }
  },
  {
    name: 'add_job',
    description: 'Manually add a job to the tracking list',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Job title'
        },
        company: {
          type: 'string',
          description: 'Company name'
        },
        platform: {
          type: 'string',
          description: 'Platform where job was found'
        },
        location: {
          type: 'string',
          description: 'Job location'
        },
        url: {
          type: 'string',
          description: 'URL to the job posting'
        },
        salary: {
          type: 'string',
          description: 'Salary range (optional)'
        }
      },
      required: ['title', 'company', 'platform']
    }
  },
  {
    name: 'update_job_status',
    description: 'Update the status of a job application',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'The job ID to update'
        },
        status: {
          type: 'string',
          description: 'New status',
          enum: ['found', 'applied', 'interview', 'rejected', 'offered']
        }
      },
      required: ['jobId', 'status']
    }
  },
  {
    name: 'delete_job',
    description: 'Remove a job from tracking',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'The job ID to delete'
        }
      },
      required: ['jobId']
    }
  },
  {
    name: 'get_filters',
    description: 'Get current job search filters (blacklist, whitelist, salary range, etc.)',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'update_filters',
    description: 'Update job search filters',
    inputSchema: {
      type: 'object',
      properties: {
        blacklist: {
          type: 'object',
          description: 'Companies or keywords to exclude',
          properties: {
            companies: { type: 'array', items: { type: 'string' } },
            keywords: { type: 'array', items: { type: 'string' } }
          }
        },
        whitelist: {
          type: 'object',
          description: 'Preferred companies or keywords',
          properties: {
            companies: { type: 'array', items: { type: 'string' } },
            keywords: { type: 'array', items: { type: 'string' } }
          }
        },
        salary: {
          type: 'object',
          description: 'Salary range',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' },
            currency: { type: 'string' }
          }
        },
        workType: {
          type: 'object',
          description: 'Work type preferences',
          properties: {
            remote: { type: 'boolean' },
            hybrid: { type: 'boolean' },
            onsite: { type: 'boolean' }
          }
        }
      }
    }
  },
  {
    name: 'get_answers',
    description: 'Get the answer library for common application questions',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'add_answer',
    description: 'Add a reusable answer to the answer library',
    inputSchema: {
      type: 'object',
      properties: {
        normalizedKey: {
          type: 'string',
          description: 'Field identifier (e.g., "work_authorization", "notice_period")'
        },
        value: {
          type: 'string',
          description: 'Answer value'
        },
        text: {
          type: 'string',
          description: 'Answer text'
        },
        label: {
          type: 'string',
          description: 'Display label'
        },
        riskLevel: {
          type: 'string',
          description: 'Risk level',
          enum: ['low', 'medium', 'high'],
          default: 'medium'
        }
      },
      required: ['normalizedKey', 'value', 'text', 'label']
    }
  },
  {
    name: 'get_pending_questions',
    description: 'Get questions that need manual review',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status',
          enum: ['pending', 'resolved', 'all'],
          default: 'pending'
        }
      }
    }
  },
  {
    name: 'resolve_question',
    description: 'Resolve a pending question with an answer',
    inputSchema: {
      type: 'object',
      properties: {
        questionId: {
          type: 'string',
          description: 'The question ID'
        },
        answer: {
          type: 'string',
          description: 'The answer to resolve with'
        }
      },
      required: ['questionId', 'answer']
    }
  },
  {
    name: 'get_stats',
    description: 'Get application statistics (total jobs, applied, interview, etc.)',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Set up tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_jobs': {
        // Note: Actual browser search would require Playwright
        // This returns instructions for the AI to use the web UI
        return {
          content: [
            {
              type: 'text',
              text: `To search for jobs, please use the web interface at http://localhost:3001 or use the /api/search endpoint.`
            },
            {
              type: 'text',
              text: `Search parameters: keywords="${args.keywords}", location="${args.location || 'Germany'}", platform="${args.platform || 'all'}"`
            }
          ]
        };
      }

      case 'get_jobs': {
        const data = readJson(appliedJsonPath, { jobs: [] });
        let jobs = data.jobs || [];
        
        if (args.status && args.status !== 'all') {
          jobs = jobs.filter(j => j.status === args.status);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(jobs, null, 2)
            }
          ]
        };
      }

      case 'add_job': {
        const data = readJson(appliedJsonPath, { jobs: [] });
        const newJob = {
          id: Date.now().toString(),
          ...args,
          status: 'found',
          appliedAt: new Date().toISOString().split('T')[0]
        };
        
        data.jobs = [newJob, ...data.jobs];
        writeJson(appliedJsonPath, data);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Added job: ${args.title} at ${args.company}`
            }
          ]
        };
      }

      case 'update_job_status': {
        const data = readJson(appliedJsonPath, { jobs: [] });
        const index = data.jobs.findIndex(j => j.id === args.jobId);
        
        if (index !== -1) {
          data.jobs[index].status = args.status;
          writeJson(appliedJsonPath, data);
          
          return {
            content: [
              {
                type: 'text',
                text: `✅ Updated job ${args.jobId} status to: ${args.status}`
              }
            ]
          };
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `❌ Job ${args.jobId} not found`
            }
          ]
        };
      }

      case 'delete_job': {
        const data = readJson(appliedJsonPath, { jobs: [] });
        data.jobs = data.jobs.filter(j => j.id !== args.jobId);
        writeJson(appliedJsonPath, data);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Deleted job ${args.jobId}`
            }
          ]
        };
      }

      case 'get_filters': {
        const filters = readJson(filtersJsonPath, {});
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(filters, null, 2)
            }
          ]
        };
      }

      case 'update_filters': {
        const current = readJson(filtersJsonPath, {});
        const updated = { ...current, ...args };
        writeJson(filtersJsonPath, updated);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Updated filters`
            }
          ]
        };
      }

      case 'get_answers': {
        const answers = readJson(answersJsonPath, { fields: [] });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(answers, null, 2)
            }
          ]
        };
      }

      case 'add_answer': {
        const data = readJson(answersJsonPath, { fields: [], pendingQuestions: [] });
        
        const newAnswer = {
          id: `ans-${Date.now()}`,
          value: args.value,
          text: args.text,
          label: args.label,
          createdAt: new Date().toISOString()
        };
        
        // Add to existing field or create new
        let fieldFound = false;
        data.fields = data.fields.map(f => {
          if (f.normalizedKey === args.normalizedKey) {
            fieldFound = true;
            return {
              ...f,
              answers: [...(f.answers || []), newAnswer]
            };
          }
          return f;
        });
        
        if (!fieldFound) {
          data.fields.push({
            normalizedKey: args.normalizedKey,
            displayName: args.label,
            fieldType: 'text',
            riskLevel: args.riskLevel || 'medium',
            answers: [newAnswer]
          });
        }
        
        writeJson(answersJsonPath, data);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Added answer for: ${args.normalizedKey}`
            }
          ]
        };
      }

      case 'get_pending_questions': {
        const data = readJson(answersJsonPath, { pendingQuestions: [] });
        let questions = data.pendingQuestions || [];
        
        if (args.status && args.status !== 'all') {
          questions = questions.filter(q => q.status === args.status);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(questions, null, 2)
            }
          ]
        };
      }

      case 'resolve_question': {
        const data = readJson(answersJsonPath, { pendingQuestions: [] });
        
        data.pendingQuestions = data.pendingQuestions.map(q => {
          if (q.id === args.questionId) {
            return { 
              ...q, 
              status: 'resolved', 
              resolvedAnswer: args.answer,
              resolvedAt: new Date().toISOString()
            };
          }
          return q;
        });
        
        writeJson(answersJsonPath, data);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Resolved question ${args.questionId}`
            }
          ]
        };
      }

      case 'get_stats': {
        const data = readJson(appliedJsonPath, { jobs: [] });
        const jobs = data.jobs || [];
        
        const stats = {
          total: jobs.length,
          found: jobs.filter(j => j.status === 'found').length,
          applied: jobs.filter(j => j.status === 'applied').length,
          interview: jobs.filter(j => j.status === 'interview').length,
          rejected: jobs.filter(j => j.status === 'rejected').length,
          offered: jobs.filter(j => j.status === 'offered').length
        };
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2)
            }
          ]
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`
            }
          ]
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ]
    };
  }
});

// Set up tools list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);

console.log('🎯 German Job Bot MCP Server running...');
console.log('   Use this server with Claude Desktop, Cursor, or any MCP-compatible AI.');
