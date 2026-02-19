"use client";

import { useState, useEffect } from 'react';
import { safeLocalStorage, STORAGE_KEYS } from '@/lib/localStorage';
import { useRouter } from 'next/navigation';
import { useTraining, TrainingCategories } from '@/hooks/useTraining';
import { usePlaybooks } from '@/hooks/usePlaybooks';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, ChevronLeft, Loader2 } from 'lucide-react';
import { TaskTemplates, TrainingTemplate } from './TaskTemplates';
import { VideoUploader } from './VideoUploader';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface AssignTaskFormProps {
  selectedUserId?: string;
  onSuccess?: () => void;
}

const FormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  dueDate: z.date().optional(),
  videoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  playId: z.string().optional(),
  assignTo: z.array(z.string()).min(1, "Please select at least one player")
});

type FormValues = z.infer<typeof FormSchema>;

export const AssignTaskForm = ({ selectedUserId, onSuccess }: AssignTaskFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { assignTask } = useTraining();
  const { playbooks } = usePlaybooks();
  
  const [submitting, setSubmitting] = useState(false);
  const [backBtnHover, setBackBtnHover] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      difficulty: 'beginner',
      videoUrl: '',
      playId: '',
      assignTo: selectedUserId ? [selectedUserId] : []
    }
  });
  
  // Get all plays for the select dropdown
  const allPlays = playbooks.flatMap(playbook => 
    playbook.plays.map(play => ({
      id: play.id,
      name: play.name,
      category: play.category,
      playbookId: playbook.id,
      playbookName: playbook.name
    }))
  );
  
  // Fetch real players from localStorage (same source as player management)
  const [players, setPlayers] = useState<Array<{ id: string; name: string; position: string }>>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      setLoadingPlayers(true);
      try {
        // First try to get players from localStorage (linked to accounts)
        const savedPlayers = safeLocalStorage.getItem(STORAGE_KEYS.PLAYERS);
        if (savedPlayers) {
          const parsed = JSON.parse(savedPlayers);
          const mappedPlayers = parsed
            .filter((p: any) => p.status === 'active' && p.linkedUserId)
            .map((p: any) => ({
              id: p.linkedUserId || p.id,
              name: `${p.firstName} ${p.lastName}`.trim(),
              position: p.position || 'Unknown'
            }));
          setPlayers(mappedPlayers);
        }
        
        // Also try to fetch from API as fallback
        if (players.length === 0) {
          const res = await fetch('/api/admin/users');
          if (res.ok) {
            const data = await res.json();
            if (data.users && Array.isArray(data.users)) {
              const apiPlayers = data.users
                .filter((u: any) => u.role === 'PLAYER')
                .map((u: any) => ({
                  id: u.id,
                  name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown',
                  position: 'Player'
                }));
              if (apiPlayers.length > 0) {
                setPlayers(prev => prev.length > 0 ? prev : apiPlayers);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading players:', error);
      } finally {
        setLoadingPlayers(false);
      }
    };
    loadPlayers();
  }, []);
  
  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      
      // Get the selected play details if a play is selected
      let playName;
      if (values.playId) {
        const selectedPlay = allPlays.find(play => play.id === values.playId);
        if (selectedPlay) {
          playName = selectedPlay.name;
        }
      }
      
      await assignTask({
        title: values.title,
        description: values.description,
        category: values.category,
        difficulty: values.difficulty,
        dueDate: values.dueDate,
        videoUrl: values.videoUrl || undefined,
        playId: values.playId,
        playName,
        assignTo: values.assignTo
      });
      
      toast({
        title: "Task assigned successfully",
        description: `${values.title} has been assigned to ${values.assignTo.length} player(s).`,
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/training');
      }
    } catch (error) {
      toast({
        title: "Failed to assign task",
        description: "An error occurred while assigning the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      <button
        onClick={handleBack}
        onMouseEnter={() => setBackBtnHover(true)}
        onMouseLeave={() => setBackBtnHover(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: '10px',
          background: backBtnHover ? 'rgba(138, 43, 226, 0.2)' : 'transparent',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          color: '#c4b5fd',
          fontSize: '0.9rem',
          fontWeight: '500',
          cursor: 'pointer',
          marginBottom: '16px',
          transition: 'all 0.2s',
        }}
      >
        <ChevronLeft style={{ height: '16px', width: '16px' }} />
        Back
      </button>
      
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '16px',
      }}>Assign New Training Task</h1>

      {/* Task Templates */}
      <TaskTemplates
        currentValues={{
          title: form.watch('title'),
          description: form.watch('description'),
          category: form.watch('category'),
          difficulty: form.watch('difficulty'),
          videoUrl: form.watch('videoUrl'),
        }}
        onSelectTemplate={(template: TrainingTemplate) => {
          form.setValue('title', template.title);
          form.setValue('description', template.description);
          form.setValue('category', template.category);
          form.setValue('difficulty', template.difficulty);
          if (template.videoUrl) {
            form.setValue('videoUrl', template.videoUrl);
          }
        }}
        onSaveTemplate={() => {
          // Template saved notification handled by TaskTemplates component
        }}
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Master Triangle Offense Play" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed instructions for the task..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide clear instructions on what the player needs to do.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TrainingCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>No due date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When should this task be completed by?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="assignTo"
                render={() => (
                  <FormItem>
                    <FormLabel style={{ color: '#c4b5fd' }}>Assign To</FormLabel>
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(10, 0, 20, 0.6)',
                      border: '1px solid rgba(138, 43, 226, 0.3)',
                    }}>
                      {loadingPlayers ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>
                          <Loader2 className="animate-spin" style={{ height: '16px', width: '16px' }} />
                          Loading players...
                        </div>
                      ) : players.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
                            No players found. Add players in Settings → Player Management.
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {players.map((player) => (
                            <FormField
                              key={player.id}
                              control={form.control}
                              name="assignTo"
                              render={({ field }) => {
                                const isSelected = field.value?.includes(player.id);
                                return (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      padding: '10px 12px',
                                      borderRadius: '8px',
                                      background: isSelected ? 'rgba(168, 85, 247, 0.2)' : 'rgba(138, 43, 226, 0.1)',
                                      border: isSelected ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(138, 43, 226, 0.2)',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                    }}
                                    onClick={() => {
                                      if (selectedUserId === player.id) return;
                                      const newValue = isSelected
                                        ? field.value?.filter((v) => v !== player.id)
                                        : [...(field.value || []), player.id];
                                      field.onChange(newValue);
                                    }}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={isSelected}
                                        disabled={selectedUserId === player.id}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, player.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== player.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <div style={{ flex: 1 }}>
                                      <span style={{ color: '#fff', fontWeight: '500', fontSize: '0.9rem' }}>
                                        {player.name}
                                      </span>
                                      <span style={{ color: '#9ca3af', marginLeft: '8px', fontSize: '0.8rem' }}>
                                        {player.position}
                                      </span>
                                    </div>
                                  </div>
                                )
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: '#c4b5fd' }}>Training Video (Optional)</FormLabel>
                    <FormControl>
                      <VideoUploader
                        currentVideoUrl={field.value}
                        onVideoSelect={(url) => field.onChange(url)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="playId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Play (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a play" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {allPlays.map(play => (
                          <SelectItem key={play.id} value={play.id}>
                            {play.name} ({play.playbookName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Link this task to a specific play from the playbook.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Task
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
