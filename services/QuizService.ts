import { supabase } from '../lib/supabase';

interface QuizQuestion {
  id: number;
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

// ✅ CRIAR QUIZ
export const createQuiz = async (
  userId: string,
  title: string,
  questions: QuizQuestion[]
) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([
        {
          user_id: userId,
          title: title,
          questions: questions,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar quiz:', error);
      return null;
    }

    console.log('✅ Quiz criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Exceção ao criar quiz:', error);
    return null;
  }
};

// ✅ ATUALIZAR QUIZ
export const updateQuiz = async (
  quizId: string,
  title: string,
  questions: QuizQuestion[]
) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .update({
        title: title,
        questions: questions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', quizId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar quiz:', error);
      return null;
    }

    console.log('✅ Quiz atualizado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Exceção ao atualizar quiz:', error);
    return null;
  }
};

// ✅ DELETAR QUIZ
export const deleteQuiz = async (quizId: string) => {
  try {
    console.log('🗑️ Tentando deletar quiz com ID:', quizId);

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (error) {
      console.error('❌ Erro ao deletar quiz:', error);
      return false;
    }

    console.log('✅ Quiz deletado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Exceção ao deletar quiz:', error);
    return false;
  }
};

// ✅ BUSCAR QUIZZES DO USUÁRIO
export const getUserQuizzes = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar quizzes:', error);
      return [];
    }

    console.log('✅ Quizzes carregados:', data.length);
    return data;
  } catch (error) {
    console.error('❌ Exceção ao buscar quizzes:', error);
    return [];
  }
};