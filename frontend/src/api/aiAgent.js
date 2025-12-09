import api from './axios';

export const sendVoiceCommand = async (commandText) => {
  const response = await api.post('/ai-agent/process-command', { command: commandText });
  return response.data;
};