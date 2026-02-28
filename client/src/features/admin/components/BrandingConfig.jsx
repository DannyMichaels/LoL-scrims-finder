import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import AddIcon from '@mui/icons-material/Add';
import Navbar from '@/components/shared/Navbar/Navbar';
import { InnerColumn } from '@/components/shared/PageComponents';
import GlassPanel from '@/components/shared/GlassPanel';
import Loading from '@/components/shared/Loading';
import useAlerts from '@/hooks/useAlerts';
import useBranding from '@/hooks/useBranding';
import { Helmet } from 'react-helmet';
import api from '@/services/apiConfig';
import BrandingForm from './BrandingForm';
import BrandingPreview from './BrandingPreview';

const EMPTY_CONFIG = {
  name: '',
  slug: '',
  domains: [],
  isDefault: false,
  branding: {
    brandName: '',
    tagline: '',
    logoUrl: '',
    faviconUrl: '',
    heroBackgroundUrl: '',
  },
  colors: {
    primaryMain: '#2196F3',
    primaryLight: '',
    primaryDark: '',
    backgroundDefault: '#0a0e1a',
    backgroundPaper: '#121826',
  },
  socialLinks: {
    discord: '',
    twitch: '',
    twitter: '',
  },
  featureCards: [],
};

export default function BrandingConfig() {
  const { brandName } = useBranding();
  const { setCurrentAlert } = useAlerts();
  const [configs, setConfigs] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [formValues, setFormValues] = useState(EMPTY_CONFIG);
  const [originalValues, setOriginalValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [s3Assets, setS3Assets] = useState([]);

  const fetchS3Assets = useCallback(async () => {
    try {
      const { data } = await api.get('/branding/assets');
      setS3Assets(data);
    } catch (err) {
      console.error('Failed to fetch S3 assets:', err);
    }
  }, []);

  const fetchConfigs = useCallback(async () => {
    try {
      const { data } = await api.get('/branding/all');
      setConfigs(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0]._id);
        setFormValues(data[0]);
        setOriginalValues(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch branding configs:', err);
      setCurrentAlert({
        type: 'Error',
        message: 'Failed to load branding configs',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedId, setCurrentAlert]);

  useEffect(() => {
    fetchConfigs();
    fetchS3Assets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectConfig = useCallback(
    (id) => {
      if (id === '__new__') {
        setCreating(true);
        setSelectedId('');
        setFormValues({ ...EMPTY_CONFIG });
        setOriginalValues(null);
        return;
      }
      setCreating(false);
      const config = configs.find((c) => c._id === id);
      if (config) {
        setSelectedId(id);
        setFormValues(config);
        setOriginalValues(config);
      }
    },
    [configs]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      if (creating) {
        if (!formValues.name || !formValues.slug) {
          setCurrentAlert({
            type: 'Error',
            message: 'Name and slug are required for new configs',
          });
          setSaving(false);
          return;
        }
        const { data } = await api.post('/branding', formValues);
        setCurrentAlert({ type: 'Success', message: 'Config created!' });
        setCreating(false);
        setConfigs((prev) => [data, ...prev]);
        setSelectedId(data._id);
        setFormValues(data);
        setOriginalValues(data);
      } else {
        const { data } = await api.patch(`/branding/${selectedId}`, formValues);
        setCurrentAlert({ type: 'Success', message: 'Config saved!' });
        setFormValues(data);
        setOriginalValues(data);
        setConfigs((prev) => prev.map((c) => (c._id === data._id ? data : c)));
      }
    } catch (err) {
      console.error('Save error:', err);
      setCurrentAlert({
        type: 'Error',
        message: err.response?.data?.error || 'Failed to save',
      });
    } finally {
      setSaving(false);
    }
  }, [creating, formValues, selectedId, setCurrentAlert]);

  const handleReset = useCallback(() => {
    if (originalValues) {
      setFormValues(originalValues);
    } else {
      setFormValues({ ...EMPTY_CONFIG });
    }
  }, [originalValues]);

  const handleUploadAsset = useCallback(
    async (base64, fileName) => {
      const slug = formValues.slug || 'default';
      try {
        const { data } = await api.post('/branding/upload-asset', {
          base64,
          fileName,
          slug,
        });
        // Refresh S3 assets list so newly uploaded file appears in browser
        fetchS3Assets();
        return data.url;
      } catch (err) {
        console.error('Upload error:', err);
        setCurrentAlert({ type: 'Error', message: 'Failed to upload asset' });
        return null;
      }
    },
    [formValues.slug, setCurrentAlert, fetchS3Assets]
  );

  if (loading) return <Loading text="Loading branding configs" />;

  return (
    <>
      <Helmet>
        <title>Branding Config | {brandName}</title>
      </Helmet>

      <Navbar showLess />
      <InnerColumn>
        <Typography variant="h1" sx={{ mb: 1 }}>
          Branding Configuration
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Manage white-label branding for different domains
        </Typography>

        {/* Tenant Selector */}
        <GlassPanel sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Select Tenant</InputLabel>
              <Select
                value={creating ? '__new__' : selectedId}
                onChange={(e) => handleSelectConfig(e.target.value)}
                label="Select Tenant">
                {configs.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name} {c.isDefault ? '(Default)' : ''} — {c.slug}
                  </MenuItem>
                ))}
                <MenuItem value="__new__">
                  <AddIcon sx={{ mr: 1, fontSize: 18 }} /> Create New
                </MenuItem>
              </Select>
            </FormControl>
            {creating && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Internal Name"
                  size="small"
                  value={formValues.name}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <TextField
                  label="Slug"
                  size="small"
                  value={formValues.slug}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, slug: e.target.value }))
                  }
                />
                <TextField
                  label="Domains (comma-separated)"
                  size="small"
                  value={(formValues.domains || []).join(', ')}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      domains: e.target.value
                        .split(',')
                        .map((d) => d.trim())
                        .filter(Boolean),
                    }))
                  }
                  sx={{ minWidth: 200 }}
                />
              </Box>
            )}
          </Box>
        </GlassPanel>

        {/* Form + Preview */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <BrandingForm
              formValues={formValues}
              setFormValues={setFormValues}
              onSave={handleSave}
              onReset={handleReset}
              saving={saving}
              onUploadAsset={handleUploadAsset}
              s3Assets={s3Assets}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <GlassPanel sx={{ p: 2, position: 'sticky', top: 80 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Live Preview
              </Typography>
              <BrandingPreview formValues={formValues} />
            </GlassPanel>
          </Grid>
        </Grid>
      </InnerColumn>
    </>
  );
}
