/*
  # Seed Initial Data for BizBoost Hub

  1. Create initial admin user roles
  2. Create sample programs for testing
  3. Insert default application form templates
  4. Create sample training materials structure
*/

-- Insert sample programs for testing
INSERT INTO programs (name, description, status, start_date, end_date, max_participants, application_deadline) VALUES
('Western Cape Accelerator Programme', 'A comprehensive 12-week accelerator program for SMMEs in the Western Cape region focusing on business growth and sustainability.', 'active', '2024-04-01', '2024-06-30', 50, '2024-03-15'),
('Digital Transformation Bootcamp', 'Intensive 6-week program helping traditional businesses adopt digital technologies and online marketing strategies.', 'active', '2024-05-01', '2024-06-15', 30, '2024-04-20'),
('Women Entrepreneurs Leadership Program', 'Specialized program for women-owned businesses focusing on leadership development and access to funding opportunities.', 'draft', '2024-06-01', '2024-08-31', 40, '2024-05-15'),
('Rural Business Development Initiative', 'Supporting rural SMMEs with tailored business development services and market access opportunities.', 'active', '2024-03-15', '2024-09-15', 60, '2024-03-01');

-- Insert sample application form configurations
INSERT INTO application_forms (program_id, form_config) VALUES
(
  (SELECT id FROM programs WHERE name = 'Western Cape Accelerator Programme' LIMIT 1),
  '{
    "fields": [
      {
        "id": "business_stage",
        "type": "select",
        "label": "Current Business Stage",
        "required": true,
        "options": ["Idea Stage", "Startup", "Early Growth", "Established"]
      },
      {
        "id": "annual_revenue",
        "type": "select",
        "label": "Annual Revenue Range",
        "required": true,
        "options": ["R0 - R100k", "R100k - R500k", "R500k - R1M", "R1M - R5M", "R5M+"]
      },
      {
        "id": "growth_challenges",
        "type": "textarea",
        "label": "What are your main growth challenges?",
        "required": true,
        "maxLength": 500
      },
      {
        "id": "program_goals",
        "type": "textarea",
        "label": "What do you hope to achieve through this program?",
        "required": true,
        "maxLength": 500
      },
      {
        "id": "commitment_availability",
        "type": "radio",
        "label": "Can you commit to attending all sessions?",
        "required": true,
        "options": ["Yes, I can attend all sessions", "I may miss 1-2 sessions", "I have scheduling conflicts"]
      }
    ]
  }'
),
(
  (SELECT id FROM programs WHERE name = 'Digital Transformation Bootcamp' LIMIT 1),
  '{
    "fields": [
      {
        "id": "current_digital_presence",
        "type": "checkbox",
        "label": "Current Digital Presence (select all that apply)",
        "required": true,
        "options": ["Website", "Social Media", "Online Store", "Digital Payments", "None"]
      },
      {
        "id": "digital_skills_level",
        "type": "select",
        "label": "Digital Skills Level",
        "required": true,
        "options": ["Beginner", "Intermediate", "Advanced"]
      },
      {
        "id": "priority_areas",
        "type": "checkbox",
        "label": "Priority Areas for Digital Transformation",
        "required": true,
        "options": ["E-commerce", "Social Media Marketing", "Digital Payments", "Customer Management", "Online Advertising"]
      },
      {
        "id": "technical_support",
        "type": "radio",
        "label": "Do you have technical support available?",
        "required": true,
        "options": ["Yes, in-house", "Yes, external consultant", "No, need support"]
      }
    ]
  }'
);

-- Insert sample program events for the Western Cape Accelerator Programme
INSERT INTO program_events (program_id, title, description, start_time, end_time, event_type, location, is_mandatory) VALUES
(
  (SELECT id FROM programs WHERE name = 'Western Cape Accelerator Programme' LIMIT 1),
  'Program Orientation & Welcome',
  'Introduction to the program, meet fellow participants, and overview of the 12-week journey ahead.',
  '2024-04-01 09:00:00+02',
  '2024-04-01 12:00:00+02',
  'orientation',
  'Cape Town Innovation Hub',
  true
),
(
  (SELECT id FROM programs WHERE name = 'Western Cape Accelerator Programme' LIMIT 1),
  'Business Model Canvas Workshop',
  'Interactive workshop on developing and refining your business model using the Business Model Canvas framework.',
  '2024-04-08 09:00:00+02',
  '2024-04-08 17:00:00+02',
  'workshop',
  'Cape Town Innovation Hub',
  true
),
(
  (SELECT id FROM programs WHERE name = 'Western Cape Accelerator Programme' LIMIT 1),
  'Financial Planning & Management',
  'Essential financial planning skills, cash flow management, and understanding financial statements.',
  '2024-04-15 09:00:00+02',
  '2024-04-15 17:00:00+02',
  'training',
  'Online - Zoom',
  true
),
(
  (SELECT id FROM programs WHERE name = 'Western Cape Accelerator Programme' LIMIT 1),
  'Marketing & Customer Acquisition',
  'Strategies for effective marketing, customer acquisition, and building brand awareness on a budget.',
  '2024-04-22 09:00:00+02',
  '2024-04-22 17:00:00+02',
  'training',
  'Cape Town Innovation Hub',
  true
);

-- Insert sample training materials
INSERT INTO program_materials (program_id, title, description, material_type, module_number, is_required) VALUES
(
  (SELECT id FROM programs WHERE name = 'Western Cape Accelerator Programme' LIMIT 1),
  'Program Handbook',
  'Comprehensive guide covering all aspects of the accelerator program, expectations, and resources.',
  'document',
  1,
  true
),
(
  (SELECT id FROM programs WHERE name = 'Western Cape Accelerator Programme' LIMIT 1),
  'Business Model Canvas Template',
  'Downloadable template for creating your business model canvas during the workshop.',
  'document',
  2,
  true
),
(
  (SELECT id FROM programs WHERE name = 'Western Cape Accelerator Programme' LIMIT 1),
  'Financial Planning Spreadsheet',
  'Excel template for cash flow forecasting and financial planning exercises.',
  'document',
  3,
  true
),
(
  (SELECT id FROM programs WHERE name = 'Western Cape Accelerator Programme' LIMIT 1),
  'Marketing Strategy Workbook',
  'Step-by-step workbook for developing your marketing strategy and customer acquisition plan.',
  'document',
  4,
  false
),
(
  (SELECT id FROM programs WHERE name = 'Digital Transformation Bootcamp' LIMIT 1),
  'Digital Readiness Assessment',
  'Self-assessment tool to evaluate your current digital capabilities and identify improvement areas.',
  'document',
  1,
  true
),
(
  (SELECT id FROM programs WHERE name = 'Digital Transformation Bootcamp' LIMIT 1),
  'Social Media Marketing Guide',
  'Comprehensive guide to leveraging social media platforms for business growth.',
  'document',
  2,
  true
);

-- Create some sample document upload records (for testing purposes)
-- Note: In production, these would be created when users actually upload files
-- This is just for demonstration of the data structure