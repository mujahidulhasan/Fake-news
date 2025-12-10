import { Template } from '../types';

const STORAGE_KEY = 'news_templates';

// --- MONGODB IMPLEMENTATION GUIDE ---
/*
  To connect this app to your MongoDB (mongodb+srv://circulerapp:...@cluster0.r0fqlq4.mongodb.net/),
  you CANNOT do it directly from this frontend file for security reasons. 
  You must create a simple Backend API (Node.js/Express).

  1. Create a server file (server.js):
  
  const mongoose = require('mongoose');
  const express = require('express');
  const app = express();
  app.use(express.json());

  mongoose.connect('mongodb+srv://circulerapp:<PASSWORD>@cluster0.r0fqlq4.mongodb.net/news_app');

  const TemplateSchema = new mongoose.Schema({
    channelId: String,
    name: String,
    boxes: Array,
    backgroundUrl: String,
    width: Number,
    height: Number
  });
  const TemplateModel = mongoose.model('Template', TemplateSchema);

  app.post('/api/templates', async (req, res) => {
    const newTemplate = new TemplateModel(req.body);
    await newTemplate.save();
    res.json({ success: true });
  });

  app.get('/api/templates/:channelId', async (req, res) => {
    const templates = await TemplateModel.find({ channelId: req.params.channelId }).sort({ _id: -1 });
    res.json(templates);
  });

  app.listen(3000, () => console.log('Server running on port 3000'));

  ---------------------------------------------------------
  
  2. Then, update the functions below to fetch() from your local server:
     e.g., await fetch('http://localhost:3000/api/templates');
*/

export const TemplateService = {
  // Load all templates
  getAll: (): Template[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get templates for a specific channel
  getByChannel: (channelId: string): Template[] => {
    const all = TemplateService.getAll();
    // Return templates for this channel, OR global templates (if we had a global flag)
    // Sorting by newest first
    return all.filter(t => t.channelId === channelId || t.channelId === 'global').reverse();
  },

  // Save or Update a template
  save: (template: Template): void => {
    const all = TemplateService.getAll();
    const index = all.findIndex(t => t._id === template._id);
    
    if (index >= 0) {
      all[index] = template;
    } else {
      all.push(template);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  // Delete a template
  delete: (id: string): void => {
    const all = TemplateService.getAll();
    const filtered = all.filter(t => t._id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};