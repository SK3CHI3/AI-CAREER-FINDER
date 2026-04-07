import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CareerPath } from '@/lib/dashboard-service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Edit2, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CareerPathwaysManagement = () => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CareerPath>>({});
  const { toast } = useToast();

  const fetchPaths = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('career_paths')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching pathways', description: error.message, variant: 'destructive' });
    } else {
      setCareerPaths(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  const handleEdit = (path: CareerPath) => {
    setIsEditing(path.id);
    setFormData(path);
  };

  const handleCreate = () => {
    setIsEditing('new');
    setFormData({
      title: '',
      category: 'Technology',
      demand_level: 'High',
      salary_range: '',
      growth_percentage: '+10%',
      description: '',
      image_url: '',
      skills_required: [],
      education_requirements: '',
      career_level: 'Entry Level',
      is_active: true
    });
  };

  const handleCancel = () => {
    setIsEditing(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast({ title: 'Validation Error', description: 'Title and Description are required', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const payload = {
      ...formData,
      updated_at: new Date().toISOString()
    };

    let error;
    if (isEditing === 'new') {
      const { error: insertError } = await supabase.from('career_paths').insert([payload as CareerPath]);
      error = insertError;
    } else {
      const { error: updateError } = await supabase.from('career_paths').update(payload).eq('id', isEditing);
      error = updateError;
    }

    if (error) {
      toast({ title: 'Error saving pathway', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Pathway saved successfully' });
      setIsEditing(null);
      fetchPaths();
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this career pathway?')) return;
    setIsLoading(true);
    const { error } = await supabase.from('career_paths').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Pathway deleted' });
      fetchPaths();
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Career Pathways</h2>
          <p className="text-muted-foreground">Manage dynamically displayed career pathways.</p>
        </div>
        <Button onClick={handleCreate} disabled={isLoading || isEditing !== null} className="bg-primary hover:bg-primary/90 text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add Pathway
        </Button>
      </div>

      {isEditing && (
        <Card className="bg-card border-border shadow-glass">
          <CardHeader>
            <CardTitle>{isEditing === 'new' ? 'Create New Pathway' : 'Edit Pathway'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Title</label>
                <Input value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background border-border" placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Category</label>
                <Input value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="bg-background border-border" placeholder="e.g. Technology" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Demand Level</label>
                <Input value={formData.demand_level || ''} onChange={e => setFormData({...formData, demand_level: e.target.value})} className="bg-background border-border" placeholder="High, Growing, etc." />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Salary Range</label>
                <Input value={formData.salary_range || ''} onChange={e => setFormData({...formData, salary_range: e.target.value})} className="bg-background border-border" placeholder="e.g. KES 100k - 200k" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Growth Rate</label>
                <Input value={formData.growth_percentage || ''} onChange={e => setFormData({...formData, growth_percentage: e.target.value})} className="bg-background border-border" placeholder="+15%" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Image URL <ImageIcon className="inline w-3 h-3 ml-1" /></label>
                <Input value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} className="bg-background border-border" placeholder="https://unsplash..." />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Career Level</label>
                <Input value={formData.career_level || ''} onChange={e => setFormData({...formData, career_level: e.target.value})} className="bg-background border-border" placeholder="e.g. Entry Level" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Education Requirements</label>
                <Input value={formData.education_requirements || ''} onChange={e => setFormData({...formData, education_requirements: e.target.value})} className="bg-background border-border" placeholder="e.g. Degree in Computer Science" />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block uppercase tracking-wider">Description</label>
              <Textarea 
                value={formData.description || ''} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="bg-background border-border min-h-[100px]" 
                placeholder="Detailed description of the career..."
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Pathway
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && !isEditing ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !isEditing && (
        <div className="bg-background border border-border rounded-xl shadow-glass overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-bold text-foreground">Image</TableHead>
                <TableHead className="font-bold text-foreground">Title & Category</TableHead>
                <TableHead className="font-bold text-foreground">Demand & Growth</TableHead>
                <TableHead className="text-right pr-6 font-bold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {careerPaths.map(path => (
                <TableRow key={path.id} className="border-border">
                  <TableCell className="w-20">
                    {path.image_url ? (
                      <img src={path.image_url} alt={path.title} className="w-12 h-12 object-cover rounded-md border border-border" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-md border border-border flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-foreground mb-1">{path.title}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{path.category}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{path.demand_level}</div>
                    <div className="text-xs text-muted-foreground">{path.growth_percentage} Growth</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(path)} className="text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(path.id)} className="text-muted-foreground hover:text-rose-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
