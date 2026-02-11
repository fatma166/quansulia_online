import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader, MessageSquare, Paperclip, Mic, Image as ImageIcon, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  sender_type: 'user' | 'bot' | 'staff';
  sender_name: string;
  message: string;
  message_type: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  created_at: string;
}

interface ChatBotProps {
  serviceCategory?: string;
  serviceType?: string;
}

export default function ChatBot({ serviceCategory, serviceType }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showUserForm, setShowUserForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [conversationMode, setConversationMode] = useState<'normal' | 'waiting_for_transaction' | 'showing_questions' | 'after_question' | 'after_transaction' | 'showing_services' | 'after_service' | 'showing_services_for_requirements' | 'after_requirements'>('normal');
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const whatsappNumber = '+966500000000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId && supabase) {
      const channel = supabase
        .channel(`conversation:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            if (newMessage.sender_type !== 'user') {
              setMessages((prev) => [...prev, newMessage]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversationId]);

  const startConversation = async () => {
    if (!userName || !userEmail) {
      alert('الرجاء إدخال الاسم والبريد الإلكتروني');
      return;
    }


    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_name: userName,
          user_email: userEmail,
          user_phone: userPhone,
          service_category: serviceCategory,
          service_type: serviceType,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      setConversationId(data.id);
      setShowUserForm(false);

      const welcomeMessage = getWelcomeMessage();
      await sendBotMessage(data.id, welcomeMessage);

      setTimeout(() => {
        const optionsMessage = getQuickActionsMessage();
        sendBotMessage(data.id, optionsMessage);
      }, 1500);

      if (serviceCategory) {
        setTimeout(() => {
          const contextMessage = getContextMessage(serviceCategory, serviceType);
          sendBotMessage(data.id, contextMessage);
        }, 2500);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('حدث خطأ في بدء المحادثة');
    } finally {
      setIsLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    return `أهلاً بك ${userName}! 🇸🇩\n\nمرحباً بك في القنصلية العامة لجمهورية السودان بجدة.\n\nأنا المساعد الذكي، هنا لمساعدتك في جميع الخدمات القنصلية.`;
  };

  const getQuickActionsMessage = () => {
    return `كيف يمكنني مساعدتك اليوم؟\n\n📋 يمكنني مساعدتك في:\n• الاستعلام عن معاملة\n• معلومات عن الخدمات\n• متطلبات الخدمات\n• التواصل مع موظف مختص\n• التواصل عبر واتساب`;
  };

  const getContextMessage = (category?: string, type?: string) => {
    const categoryMessages: Record<string, string> = {
      education: '🎓 **الخدمات التعليمية**\n\nيمكنني مساعدتك في:\n• شهادات التعليم الأساسي\n• شهادات الثانوية\n• توثيق الشهادات\n• متطلبات كل خدمة\n• الرسوم والمدة\n\nما الذي تحتاج معرفته؟',
      poa: '📝 **خدمات التوكيلات**\n\nيمكنني مساعدتك في:\n• التوكيل العام\n• توكيلات المحاكم والقضايا\n• توكيلات العقارات\n• توكيلات السيارات\n• توكيلات الشركات\n\nأي نوع من التوكيلات تحتاج؟',
      passports: '🛂 **خدمات جوازات السفر**\n\nيمكنني مساعدتك في:\n• إصدار جواز سفر جديد\n• تجديد جواز السفر\n• بدل فاقد/تالف\n• الرسوم والمدة المطلوبة\n• المستندات المطلوبة\n\nما الذي تريد معرفته؟',
      documents: '📄 **خدمات الوثائق**\n\nيمكنني مساعدتك في:\n• التوثيق والتصديقات\n• الإفادات والإقرارات\n• السجل المدني\n• الشؤون الأسرية\n\nكيف يمكنني مساعدتك؟',
    };

    return categoryMessages[category || ''] || 'اختر من الخيارات أعلاه أو اكتب استفسارك مباشرة.';
  };

  const sendBotMessage = async (convId: string, message: string) => {
    if (!supabase) return;
    const { data, error } = await supabase.from('chat_messages').insert({
      conversation_id: convId,
      sender_type: 'bot',
      sender_name: 'المساعد الذكي',
      message,
      message_type: 'text',
    }).select().single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'audio' | 'file') => {
    if (!conversationId || !supabase) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${conversationId}/${Date.now()}.${fileExt}`;

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      await sendMessageWithAttachment(file.name, base64, type);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('حدث خطأ في رفع الملف');
    } finally {
      setIsUploading(false);
    }
  };

  const sendMessageWithAttachment = async (fileName: string, fileUrl: string, fileType: string) => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'user',
          sender_name: userName,
          message: `تم إرسال ${fileType === 'image' ? 'صورة' : fileType === 'audio' ? 'رسالة صوتية' : 'ملف'}`,
          message_type: 'attachment',
          attachment_url: fileUrl,
          attachment_type: fileType,
          attachment_name: fileName,
        })
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => [...prev, data]);

      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error sending message with attachment:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId || !supabase) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setShowQuickActions(false);

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'user',
          sender_name: userName,
          message: userMessage,
          message_type: 'text',
        })
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => [...prev, data]);

      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      setTimeout(() => handleBotResponse(userMessage), 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const fetchQuestions = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('chatbot_questions_answers')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  };

  const searchTransaction = async (transactionNumber: string) => {
    if (!supabase) return null;
    try {
      const cleanNumber = transactionNumber.trim();
      const { data, error } = await supabase
        .from('applications')
        .select('id, reference_number, status, service_id, created_at')
        .eq('reference_number', cleanNumber)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching transaction:', error);
      return null;
    }
  };

  const fetchActiveServices = async () => {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name_ar, name_en, description_ar, description_en, category, subcategory, price, processing_time_days')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name_ar', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  };

  const fetchServiceRequirementsAndDocuments = async (serviceId: string) => {
    if (!supabase) return { requirements: [], documents: [] };
    try {
      const [requirementsResult, documentsResult] = await Promise.all([
        supabase
          .from('service_requirements')
          .select('*')
          .eq('service_id', serviceId)
          .order('display_order', { ascending: true }),
        supabase
          .from('service_documents')
          .select('*')
          .eq('service_id', serviceId)
          .order('display_order', { ascending: true })
      ]);

      return {
        requirements: requirementsResult.data || [],
        documents: documentsResult.data || []
      };
    } catch (error) {
      console.error('Error fetching service requirements and documents:', error);
      return { requirements: [], documents: [] };
    }
  };

  const handleBotResponse = async (userMessage: string) => {
    if (!conversationId) return;

    let response = '';
    const lowerMessage = userMessage.toLowerCase().trim();

    if (lowerMessage.includes('القائمة الرئيسية') || lowerMessage === 'القائمة' || lowerMessage === 'رئيسية' ||
        (lowerMessage === '2' && (conversationMode === 'after_question' || conversationMode === 'after_transaction' || conversationMode === 'after_service' || conversationMode === 'after_requirements'))) {
      setConversationMode('normal');
      setShowQuickActions(true);
      response = '🏠 **القائمة الرئيسية**\n\nكيف يمكنني مساعدتك؟\n\nاختر من الخيارات أدناه أو اكتب سؤالك مباشرة.';
      await sendBotMessage(conversationId, response);
      return;
    }

    if (lowerMessage.includes('سؤال آخر') || lowerMessage.includes('سؤال اخر') || (lowerMessage === '1' && conversationMode === 'after_question')) {
      const questions = await fetchQuestions();
      setAvailableQuestions(questions);
      setConversationMode('showing_questions');

      if (questions.length > 0) {
        response = '❓ **الأسئلة الشائعة**\n\nاختر السؤال الذي تريد الإجابة عليه:\n\n';
        questions.forEach((q: any, idx: number) => {
          response += `${idx + 1}. ${q.question_ar}\n`;
        });
        response += '\n💡 أرسل رقم السؤال للحصول على الإجابة';
      } else {
        response = 'عذراً، لا توجد أسئلة متاحة حالياً.';
        setConversationMode('normal');
      }

      await sendBotMessage(conversationId, response);
      return;
    }

    if (lowerMessage.includes('خدمة أخرى') || lowerMessage.includes('خدمة اخرى') || (lowerMessage === '1' && conversationMode === 'after_service')) {
      const services = await fetchActiveServices();
      setAvailableServices(services);
      setConversationMode('showing_services');

      if (services.length > 0) {
        response = '📋 **الخدمات المتاحة**\n\nاختر الخدمة التي تريد معرفة المزيد عنها:\n\n';
        services.forEach((service: any, idx: number) => {
          response += `${idx + 1}. ${service.name_ar}\n`;
        });
        response += '\n💡 أرسل رقم الخدمة للحصول على التفاصيل';
      } else {
        response = 'عذراً، لا توجد خدمات متاحة حالياً.';
        setConversationMode('normal');
      }

      await sendBotMessage(conversationId, response);
      return;
    }

    if ((lowerMessage === '1' && conversationMode === 'after_requirements')) {
      const services = await fetchActiveServices();
      setAvailableServices(services);
      setConversationMode('showing_services_for_requirements');

      if (services.length > 0) {
        response = '📋 **الخدمات المتاحة**\n\nاختر الخدمة التي تريد معرفة متطلباتها ومستنداتها:\n\n';
        services.forEach((service: any, idx: number) => {
          response += `${idx + 1}. ${service.name_ar}\n`;
        });
        response += '\n💡 أرسل رقم الخدمة للحصول على المتطلبات والمستندات';
      } else {
        response = 'عذراً، لا توجد خدمات متاحة حالياً.';
        setConversationMode('normal');
      }

      await sendBotMessage(conversationId, response);
      return;
    }

    if (lowerMessage.includes('استعلام آخر') || lowerMessage.includes('استعلام اخر') || (lowerMessage === '1' && conversationMode === 'after_transaction')) {
      response = '🔍 **الاستعلام عن معاملة**\n\nالرجاء إدخال رقم المعاملة الخاص بك:\n\nمثال: TRX-2024-001234';
      setConversationMode('waiting_for_transaction');
      await sendBotMessage(conversationId, response);
      return;
    }

    if (conversationMode === 'waiting_for_transaction') {
      const transaction = await searchTransaction(userMessage);

      if (transaction) {
        const statusMap: Record<string, string> = {
          'pending': 'قيد الانتظار',
          'under_review': 'قيد المراجعة',
          'approved': 'تم القبول',
          'rejected': 'مرفوض',
          'completed': 'مكتمل'
        };

        const statusText = statusMap[transaction.status] || transaction.status;
        const trackingUrl = `${window.location.origin}/track/${transaction.reference_number}`;

        response = `✅ **تم العثور على المعاملة**\n\nرقم المعاملة: ${transaction.reference_number}\nالحالة: ${statusText}\nتاريخ التقديم: ${new Date(transaction.created_at).toLocaleDateString('ar-SA')}\n\n🔗 [اضغط هنا لتتبع المعاملة](${trackingUrl})\n\n━━━━━━━━━━━━\n\n📌 **ماذا تريد أن تفعل الآن؟**\n1️⃣ استعلام آخر\n2️⃣ القائمة الرئيسية`;
      } else {
        response = `❌ **لم يتم العثور على المعاملة**\n\nرقم المعاملة "${userMessage}" غير موجود في النظام.\n\nالرجاء التأكد من الرقم والمحاولة مرة أخرى.\n\n━━━━━━━━━━━━\n\n📌 **ماذا تريد أن تفعل الآن؟**\n1️⃣ استعلام آخر\n2️⃣ القائمة الرئيسية`;
      }

      setConversationMode('after_transaction');
      await sendBotMessage(conversationId, response);
      return;
    }

    if (userMessage.toLowerCase().includes('استفسار') || userMessage.toLowerCase().includes('أسئلة شائعة')) {
      const questions = await fetchQuestions();
      setAvailableQuestions(questions);
      setConversationMode('showing_questions');

      if (questions.length > 0) {
        response = '❓ **الأسئلة الشائعة**\n\nاختر السؤال الذي تريد الإجابة عليه:\n\n';
        questions.forEach((q: any, idx: number) => {
          response += `${idx + 1}. ${q.question_ar}\n`;
        });
        response += '\n💡 أرسل رقم السؤال للحصول على الإجابة';
      } else {
        response = 'عذراً، لا توجد أسئلة متاحة حالياً.';
        setConversationMode('normal');
      }

      await sendBotMessage(conversationId, response);
      return;
    }

    if (conversationMode === 'showing_questions') {
      const questionIndex = parseInt(userMessage.trim()) - 1;

      if (questionIndex >= 0 && questionIndex < availableQuestions.length) {
        const selectedQuestion = availableQuestions[questionIndex];
        response = `❓ **${selectedQuestion.question_ar}**\n\n${selectedQuestion.answer_ar}\n\n━━━━━━━━━━━━\n\n📌 **ماذا تريد أن تفعل الآن؟**\n1️⃣ سؤال آخر\n2️⃣ القائمة الرئيسية`;

        if (supabase) {
          await supabase
            .from('chatbot_questions_answers')
            .update({ usage_count: (selectedQuestion.usage_count || 0) + 1 })
            .eq('id', selectedQuestion.id);
        }

        setConversationMode('after_question');
      } else {
        response = '❌ الرقم غير صحيح. الرجاء اختيار رقم من القائمة أعلاه.';
        setConversationMode('showing_questions');
      }

      await sendBotMessage(conversationId, response);
      return;
    }

    if (conversationMode === 'showing_services') {
      const serviceIndex = parseInt(userMessage.trim()) - 1;

      if (serviceIndex >= 0 && serviceIndex < availableServices.length) {
        const selectedService = availableServices[serviceIndex];

        response = `📋 **${selectedService.name_ar}**\n\n`;

        if (selectedService.description_ar) {
          response += `📝 **الوصف:**\n${selectedService.description_ar}\n\n`;
        }

        if (selectedService.price) {
          response += `💰 **الرسوم:** ${selectedService.price} ريال\n\n`;
        }

        if (selectedService.processing_time_days) {
          response += `⏱️ **مدة الإنجاز:** ${selectedService.processing_time_days} يوم\n\n`;
        }

        const serviceUrl = `${window.location.origin}/services/${selectedService.category}/${selectedService.id}`;
        response += `🔗 [اضغط هنا لتقديم طلب للخدمة](${serviceUrl})\n\n`;

        response += `━━━━━━━━━━━━\n\n📌 **ماذا تريد أن تفعل الآن؟**\n1️⃣ خدمة أخرى\n2️⃣ القائمة الرئيسية`;

        setConversationMode('after_service');
      } else {
        response = '❌ الرقم غير صحيح. الرجاء اختيار رقم من القائمة أعلاه.';
        setConversationMode('showing_services');
      }

      await sendBotMessage(conversationId, response);
      return;
    }

    if (conversationMode === 'showing_services_for_requirements') {
      const serviceIndex = parseInt(userMessage.trim()) - 1;

      if (serviceIndex >= 0 && serviceIndex < availableServices.length) {
        const selectedService = availableServices[serviceIndex];
        const { requirements, documents } = await fetchServiceRequirementsAndDocuments(selectedService.id);

        response = `📋 **${selectedService.name_ar}**\n\n`;

        if (requirements.length > 0) {
          response += `📝 **المتطلبات:**\n\n`;
          requirements.forEach((req: any, idx: number) => {
            response += `${idx + 1}. ${req.requirement_ar}${req.is_mandatory ? ' (إلزامي)' : ' (اختياري)'}\n`;
          });
          response += `\n`;
        }

        if (documents.length > 0) {
          response += `📄 **المستندات المطلوبة:**\n\n`;
          documents.forEach((doc: any, idx: number) => {
            response += `${idx + 1}. ${doc.document_name_ar}${doc.is_mandatory ? ' (إلزامي)' : ' (اختياري)'}\n`;
          });
          response += `\n`;
        }

        if (requirements.length === 0 && documents.length === 0) {
          response += `ℹ️ لا توجد متطلبات أو مستندات محددة لهذه الخدمة.\n\n`;
        }

        const serviceUrl = `${window.location.origin}/services/${selectedService.category}/${selectedService.id}`;
        response += `🔗 [اضغط هنا لتقديم طلب للخدمة](${serviceUrl})\n\n`;

        response += `━━━━━━━━━━━━\n\n📌 **ماذا تريد أن تفعل الآن؟**\n1️⃣ خدمة أخرى\n2️⃣ القائمة الرئيسية`;

        setConversationMode('after_requirements');
      } else {
        response = '❌ الرقم غير صحيح. الرجاء اختيار رقم من القائمة أعلاه.';
        setConversationMode('showing_services_for_requirements');
      }

      await sendBotMessage(conversationId, response);
      return;
    }

    if (userMessage.toLowerCase().includes('معلومات عن الخدمات') || userMessage.toLowerCase().includes('الخدمات المتاحة')) {
      const services = await fetchActiveServices();
      setAvailableServices(services);
      setConversationMode('showing_services');

      if (services.length > 0) {
        response = '📋 **الخدمات المتاحة**\n\nاختر الخدمة التي تريد معرفة المزيد عنها:\n\n';
        services.forEach((service: any, idx: number) => {
          response += `${idx + 1}. ${service.name_ar}\n`;
        });
        response += '\n💡 أرسل رقم الخدمة للحصول على التفاصيل';
      } else {
        response = 'عذراً، لا توجد خدمات متاحة حالياً.';
        setConversationMode('normal');
      }

      await sendBotMessage(conversationId, response);
      return;
    }

    if (userMessage.toLowerCase().includes('متطلبات الخدمات') || userMessage.toLowerCase().includes('المتطلبات والمستندات') || userMessage.toLowerCase().includes('متطلبات')) {
      const services = await fetchActiveServices();
      setAvailableServices(services);
      setConversationMode('showing_services_for_requirements');

      if (services.length > 0) {
        response = '📋 **الخدمات المتاحة**\n\nاختر الخدمة التي تريد معرفة متطلباتها ومستنداتها:\n\n';
        services.forEach((service: any, idx: number) => {
          response += `${idx + 1}. ${service.name_ar}\n`;
        });
        response += '\n💡 أرسل رقم الخدمة للحصول على المتطلبات والمستندات';
      } else {
        response = 'عذراً، لا توجد خدمات متاحة حالياً.';
        setConversationMode('normal');
      }

      await sendBotMessage(conversationId, response);
      return;
    }

    if (userMessage.toLowerCase().includes('استعلام عن معاملة') || userMessage.toLowerCase().includes('أريد الاستعلام')) {
      response = '🔍 **الاستعلام عن معاملة**\n\nالرجاء إدخال رقم المعاملة الخاص بك:\n\nمثال: TRX-2024-001234';
      setConversationMode('waiting_for_transaction');
      await sendBotMessage(conversationId, response);
      return;
    }

    if (userMessage.toLowerCase().includes('موظف') || userMessage.toLowerCase().includes('تواصل مباشر')) {
      response = '👨‍💼 **التواصل مع موظف**\n\nسأقوم بتوصيلك مع أحد موظفينا المختصين.\n\nسيتم الرد عليك في أقرب وقت إذا كان هناك موظف متاح حالياً.\n\nيمكنك الآن إرسال:\n📷 صور\n🎤 رسائل صوتية\n📎 ملفات';
      await assignToStaff();
      await sendBotMessage(conversationId, response);
      return;
    }

    try {
      const ChatbotAI = (await import('../utils/chatbotAI')).default;
      const chatbot = new ChatbotAI();

      const result = await chatbot.findBestMatch(userMessage);

      if (result && !result.isDefault) {
        const categoryIcon = result.category?.icon || '💬';
        const categoryName = result.category?.name_ar || '';

        response = `${categoryIcon} ${categoryName ? `**${categoryName}**\n\n` : ''}${result.answer}`;

        if (result.confidence < 60) {
          response += '\n\n---\n\nℹ️ إذا لم تجد الإجابة المناسبة، يمكنك التواصل مع موظف مختص.';
        }
      } else {
        response = chatbot.getDefaultResponse().answer;
      }
    } catch (error) {
      console.error('Error getting bot response:', error);
      response = 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى أو التواصل مع موظف مختص.';
    }

    await sendBotMessage(conversationId, response);
  };

  const assignToStaff = async () => {
    if (!conversationId || !supabase) return;

    try {
      const { data: staff } = await supabase
        .from('chat_staff')
        .select('email')
        .eq('is_online', true)
        .contains('service_categories', serviceCategory ? [serviceCategory] : [])
        .limit(1)
        .maybeSingle();

      if (staff) {
        await supabase
          .from('chat_conversations')
          .update({ status: 'waiting', assigned_to: staff.email })
          .eq('id', conversationId);
      }
    } catch (error) {
      console.error('Error assigning to staff:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    handleSendMessageDirect(action);
    setShowQuickActions(false);
  };

  const handleSendMessageDirect = async (message: string) => {
    if (!conversationId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'user',
          sender_name: userName,
          message: message,
          message_type: 'text',
        })
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => [...prev, data]);

      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      setTimeout(() => handleBotResponse(message), 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `مرحباً، أنا ${userName}\nأحتاج مساعدة في خدمات القنصلية.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const renderMessageWithLinks = (message: string) => {
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkPattern.exec(message)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex}>{message.substring(lastIndex, match.index)}</span>
        );
      }

      const linkText = match[1];
      const linkUrl = match[2];

      parts.push(
        <a
          key={match.index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline font-semibold"
        >
          {linkText}
          <ExternalLink className="w-3 h-3" />
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < message.length) {
      parts.push(<span key={lastIndex}>{message.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : message;
  };

  const renderAttachment = (msg: Message) => {
    if (!msg.attachment_url) return null;

    if (msg.attachment_type === 'image') {
      return (
        <img
          src={msg.attachment_url}
          alt={msg.attachment_name}
          className="max-w-full rounded-lg mt-2 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ maxHeight: '200px' }}
          onClick={() => window.open(msg.attachment_url, '_blank')}
        />
      );
    }

    if (msg.attachment_type === 'audio') {
      return (
        <audio controls className="mt-2 w-full max-w-xs">
          <source src={msg.attachment_url} />
          متصفحك لا يدعم تشغيل الصوت
        </audio>
      );
    }

    return (
      <a
        href={msg.attachment_url}
        download={msg.attachment_name}
        className="flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
      >
        <FileText className="w-4 h-4" />
        {msg.attachment_name || 'تحميل الملف'}
      </a>
    );
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'file');
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'image');
        }}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, 'audio');
        }}
      />

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-50 group"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            !
          </span>
          <span className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
            💬 تحدث معنا الآن
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-[#276073]">
          <div className="bg-[#276073] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">المساعد الذكي</h3>
                <p className="text-xs text-blue-100">القنصلية السودانية - جدة</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {showUserForm ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
              <div className="bg-white rounded-xl p-6 shadow-md w-full max-w-sm border border-[#276073]/30">
                <div className="text-center mb-6">
                  <div className="inline-block bg-[#276073]/10 p-4 rounded-full mb-3">
                    <Bot className="w-8 h-8 text-[#276073]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">🇸🇩 أهلاً وسهلاً</h3>
                  <p className="text-gray-600 text-sm">القنصلية السودانية بجدة</p>
                  <p className="text-gray-500 text-xs mt-2">تفضل بتعريفنا بنفسك</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="الاسم الكامل *"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#276073]/30 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-[#276073] outline-none"
                  />
                  <input
                    type="email"
                    placeholder="البريد الإلكتروني *"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#276073]/30 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-[#276073] outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="رقم الهاتف (اختياري)"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#276073]/30 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-[#276073] outline-none"
                  />
                  <button
                    onClick={startConversation}
                    disabled={isLoading}
                    className="w-full bg-[#276073] hover:bg-[#1e4a5a] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        جاري البدء...
                      </span>
                    ) : (
                      'بدء المحادثة'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.sender_type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.sender_type === 'user'
                          ? 'bg-blue-100'
                          : msg.sender_type === 'bot'
                          ? 'bg-[#276073]/10'
                          : 'bg-purple-100'
                      }`}
                    >
                      {msg.sender_type === 'user' ? (
                        <User className="w-4 h-4 text-blue-600" />
                      ) : msg.sender_type === 'bot' ? (
                        <Bot className="w-4 h-4 text-[#276073]" />
                      ) : (
                        <User className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        msg.sender_type === 'user'
                          ? 'bg-[#276073] text-white rounded-tr-none'
                          : 'bg-white text-gray-800 rounded-tl-none shadow-md border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{renderMessageWithLinks(msg.message)}</p>
                      {renderAttachment(msg)}
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender_type === 'user' ? 'text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {showQuickActions && messages.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4 px-2">
                    <p className="text-xs text-gray-500 text-center font-semibold mb-1">⚡ إجراءات سريعة</p>
                    <button
                      onClick={() => handleQuickAction('أريد الاستعلام عن معاملة')}
                      className="bg-white border-2 border-[#276073]/30 text-gray-700 px-4 py-2.5 rounded-lg text-sm hover:bg-[#276073]/5 hover:border-[#276073] transition-all shadow-sm font-medium"
                    >
                      🔍 استعلام عن معاملة
                    </button>
                    <button
                      onClick={() => handleQuickAction('أسئلة شائعة واستفسارات')}
                      className="bg-white border-2 border-[#276073]/30 text-gray-700 px-4 py-2.5 rounded-lg text-sm hover:bg-[#276073]/5 hover:border-[#276073] transition-all shadow-sm font-medium"
                    >
                      ❓ استفسارات
                    </button>
                    <button
                      onClick={() => handleQuickAction('أريد معلومات عن الخدمات المتاحة')}
                      className="bg-white border-2 border-[#276073]/30 text-gray-700 px-4 py-2.5 rounded-lg text-sm hover:bg-[#276073]/5 hover:border-[#276073] transition-all shadow-sm font-medium"
                    >
                      📋 معلومات عن الخدمات
                    </button>
                    <button
                      onClick={() => handleQuickAction('ما هي المتطلبات والمستندات المطلوبة')}
                      className="bg-white border-2 border-[#276073]/30 text-gray-700 px-4 py-2.5 rounded-lg text-sm hover:bg-[#276073]/5 hover:border-[#276073] transition-all shadow-sm font-medium"
                    >
                      📝 المتطلبات والمستندات
                    </button>
                    <button
                      onClick={() => handleQuickAction('أريد التواصل مع موظف مختص')}
                      className="bg-white border-2 border-[#276073]/30 text-gray-700 px-4 py-2.5 rounded-lg text-sm hover:bg-[#276073]/5 hover:border-[#276073] transition-all shadow-sm font-medium"
                    >
                      👨‍💼 التواصل مع موظف
                    </button>
                    <button
                      onClick={openWhatsApp}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm transition-all shadow-md font-medium flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      💬 تواصل عبر واتساب
                    </button>
                  </div>
                )}

                {isUploading && (
                  <div className="flex items-center justify-center gap-2 text-[#276073]">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span className="text-sm">جاري رفع الملف...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t-2 border-gray-200">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 text-[#276073] hover:bg-[#276073]/10 rounded-lg transition-colors disabled:opacity-50"
                    title="إرسال صورة"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => audioInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 text-[#276073] hover:bg-[#276073]/10 rounded-lg transition-colors disabled:opacity-50"
                    title="إرسال رسالة صوتية"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 text-[#276073] hover:bg-[#276073]/10 rounded-lg transition-colors disabled:opacity-50"
                    title="إرسال ملف"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 px-4 py-2 border-2 border-[#276073]/30 rounded-full focus:ring-2 focus:ring-[#276073] focus:border-[#276073] outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isUploading}
                    className="bg-[#276073] hover:bg-[#1e4a5a] text-white p-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
