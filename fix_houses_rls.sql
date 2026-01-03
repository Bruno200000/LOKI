-- 🔧 Fix temporaire pour les permissions RLS des maisons
-- Permet aux admins de voir TOUTES les maisons (available + taken)

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "houses_select_policy" ON public.houses;

-- Recréer la politique avec une condition plus permissive pour les admins
CREATE POLICY "houses_select_policy" ON public.houses
FOR SELECT
USING (
  status = 'available' OR
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
  -- Les admins peuvent voir toutes les maisons, peu importe le statut
  OR (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
);
