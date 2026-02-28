import React, { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GlassPanel from '@/components/shared/GlassPanel';
import { alpha } from '@mui/material/styles';
import HERO_BACKGROUNDS from '@/assets/heroBackgrounds';

function ImageUploadField({ label, value, onChange, onUpload }) {
  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result, file.name);
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          fullWidth
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL or upload file"
        />
        <Button
          variant="outlined"
          component="label"
          size="small"
          startIcon={<CloudUploadIcon />}
          sx={{ whiteSpace: 'nowrap' }}>
          Upload
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </Button>
      </Box>
      {value && (
        <Box sx={{ mt: 1 }}>
          <img
            src={value}
            alt={label}
            style={{
              maxWidth: 120,
              maxHeight: 60,
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default function BrandingForm({
  formValues,
  setFormValues,
  onSave,
  onReset,
  saving,
  onUploadAsset,
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [domainsText, setDomainsText] = useState(
    (formValues.domains || []).join(', ')
  );

  // Sync domainsText when formValues changes externally (e.g. tenant switch)
  useEffect(() => {
    setDomainsText((formValues.domains || []).join(', '));
  }, [formValues._id]); // re-sync when a different tenant is selected

  const handleDomainsBlur = useCallback(() => {
    setFormValues((prev) => ({
      ...prev,
      domains: domainsText
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean),
    }));
  }, [domainsText, setFormValues]);

  const updateBranding = useCallback(
    (field, value) => {
      setFormValues((prev) => ({
        ...prev,
        branding: { ...prev.branding, [field]: value },
      }));
    },
    [setFormValues]
  );

  const updateColor = useCallback(
    (field, value) => {
      setFormValues((prev) => ({
        ...prev,
        colors: { ...prev.colors, [field]: value },
      }));
    },
    [setFormValues]
  );

  const updateSocialLink = useCallback(
    (field, value) => {
      setFormValues((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value },
      }));
    },
    [setFormValues]
  );

  const handleAssetUpload = useCallback(
    async (field, base64, fileName) => {
      if (onUploadAsset) {
        const url = await onUploadAsset(base64, fileName);
        if (url) {
          updateBranding(field, url);
        }
      }
    },
    [onUploadAsset, updateBranding]
  );

  return (
    <Box>
      {/* Brand Identity */}
      <GlassPanel sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Brand Identity
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Internal Name"
            size="small"
            fullWidth
            value={formValues.name || ''}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <TextField
            label="Slug"
            size="small"
            fullWidth
            value={formValues.slug || ''}
            InputProps={{ readOnly: !!formValues._id }}
            helperText={formValues._id ? 'Cannot change slug after creation' : ''}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, slug: e.target.value }))
            }
          />
        </Box>
        <TextField
          label="Brand Name"
          fullWidth
          size="small"
          value={formValues.branding?.brandName || ''}
          onChange={(e) => updateBranding('brandName', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Tagline"
          fullWidth
          size="small"
          value={formValues.branding?.tagline || ''}
          onChange={(e) => updateBranding('tagline', e.target.value)}
        />
      </GlassPanel>

      {/* Domains */}
      <GlassPanel sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Domains
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Hostnames that serve this branding (comma-separated). The app matches
          the visitor's hostname to determine which branding to show.
        </Typography>
        <TextField
          label="Domains"
          fullWidth
          size="small"
          placeholder="example.gg, www.example.gg, localhost"
          value={domainsText}
          onChange={(e) => setDomainsText(e.target.value)}
          onBlur={handleDomainsBlur}
        />
      </GlassPanel>

      {/* Asset Uploads */}
      <GlassPanel sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Assets
        </Typography>
        <ImageUploadField
          label="Logo"
          value={formValues.branding?.logoUrl}
          onChange={(val) => updateBranding('logoUrl', val)}
          onUpload={(base64, fileName) =>
            handleAssetUpload('logoUrl', base64, fileName)
          }
        />
        <ImageUploadField
          label="Favicon"
          value={formValues.branding?.faviconUrl}
          onChange={(val) => updateBranding('faviconUrl', val)}
          onUpload={(base64, fileName) =>
            handleAssetUpload('faviconUrl', base64, fileName)
          }
        />
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Hero Background
          </Typography>
          <Grid container spacing={1}>
            <Grid item>
              <Box
                onClick={() => updateBranding('heroBackgroundUrl', '')}
                sx={{
                  width: 100,
                  height: 56,
                  borderRadius: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: !formValues.branding?.heroBackgroundUrl
                    ? '2px solid'
                    : '1px solid rgba(255,255,255,0.15)',
                  borderColor: !formValues.branding?.heroBackgroundUrl
                    ? 'primary.main'
                    : 'rgba(255,255,255,0.15)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }}>
                <Typography variant="caption" color="text.secondary">
                  None
                </Typography>
              </Box>
            </Grid>
            {Object.entries(HERO_BACKGROUNDS).map(([key, { src, label }]) => (
              <Grid item key={key}>
                <Box
                  onClick={() => updateBranding('heroBackgroundUrl', key)}
                  sx={{
                    width: 100,
                    height: 56,
                    borderRadius: 1,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    border:
                      formValues.branding?.heroBackgroundUrl === key
                        ? '2px solid'
                        : '1px solid rgba(255,255,255,0.15)',
                    borderColor:
                      formValues.branding?.heroBackgroundUrl === key
                        ? 'primary.main'
                        : 'rgba(255,255,255,0.15)',
                    position: 'relative',
                    '&:hover': { borderColor: 'primary.light' },
                  }}>
                  <img
                    src={src}
                    alt={label}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(0,0,0,0.7)',
                      px: 0.5,
                    }}>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.6rem', color: '#fff' }}>
                      {label}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </GlassPanel>

      {/* Colors */}
      <GlassPanel sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Colors
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ minWidth: 100 }}>
            Primary Color
          </Typography>
          <input
            type="color"
            value={formValues.colors?.primaryMain || '#2196F3'}
            onChange={(e) => updateColor('primaryMain', e.target.value)}
            style={{
              width: 48,
              height: 36,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: 'transparent',
            }}
          />
          <TextField
            size="small"
            value={formValues.colors?.primaryMain || '#2196F3'}
            onChange={(e) => updateColor('primaryMain', e.target.value)}
            sx={{ width: 120 }}
          />
        </Box>

        <Accordion
          expanded={advancedOpen}
          onChange={() => setAdvancedOpen(!advancedOpen)}
          sx={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:before': { display: 'none' },
          }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="text.secondary">
              Advanced Color Overrides
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {[
                { field: 'primaryLight', label: 'Primary Light' },
                { field: 'primaryDark', label: 'Primary Dark' },
                { field: 'backgroundDefault', label: 'Background Default' },
                { field: 'backgroundPaper', label: 'Background Paper' },
              ].map(({ field, label }) => (
                <Grid item xs={6} key={field}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="color"
                      value={formValues.colors?.[field] || '#000000'}
                      onChange={(e) => updateColor(field, e.target.value)}
                      style={{
                        width: 32,
                        height: 28,
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        background: 'transparent',
                      }}
                    />
                    <TextField
                      label={label}
                      size="small"
                      fullWidth
                      value={formValues.colors?.[field] || ''}
                      onChange={(e) => updateColor(field, e.target.value)}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </GlassPanel>

      {/* Social Links */}
      <GlassPanel sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Social Links
        </Typography>
        <TextField
          label="Discord URL"
          fullWidth
          size="small"
          value={formValues.socialLinks?.discord || ''}
          onChange={(e) => updateSocialLink('discord', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Twitch URL"
          fullWidth
          size="small"
          value={formValues.socialLinks?.twitch || ''}
          onChange={(e) => updateSocialLink('twitch', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Twitter URL"
          fullWidth
          size="small"
          value={formValues.socialLinks?.twitter || ''}
          onChange={(e) => updateSocialLink('twitter', e.target.value)}
        />
      </GlassPanel>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving}
          sx={(theme) => ({
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          })}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outlined" onClick={onReset} disabled={saving}>
          Reset
        </Button>
      </Box>
    </Box>
  );
}
