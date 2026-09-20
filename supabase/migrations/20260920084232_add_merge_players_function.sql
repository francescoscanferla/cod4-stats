CREATE OR REPLACE FUNCTION public.merge_players(src_name TEXT, tgt_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  src_id UUID;
  tgt_id UUID;
BEGIN
  SELECT id INTO src_id FROM public.players WHERE player_name = src_name;
  SELECT id INTO tgt_id FROM public.players WHERE player_name = tgt_name;

  IF src_id IS NULL THEN
    RAISE EXCEPTION 'source player "%" non trovato', src_name;
  END IF;
  IF tgt_id IS NULL THEN
    RAISE EXCEPTION 'target player "%" non trovato', tgt_name;
  END IF;
  IF src_id = tgt_id THEN
    RAISE EXCEPTION 'source e target coincidono (%)', src_name;
  END IF;

  UPDATE public.matches_events SET attacker_id = tgt_id WHERE attacker_id = src_id;
  UPDATE public.matches_events SET victim_id = tgt_id WHERE victim_id = src_id;

  DELETE FROM public.players WHERE id = src_id;

  RAISE NOTICE 'Merge % (%) -> % (%) completato', src_name, src_id, tgt_name, tgt_id;
END;
$$;

COMMENT ON FUNCTION public.merge_players(TEXT, TEXT) IS 'Unisce due player con stesso proprietario: sposta tutti i matches_events dal source al target (per player_name case-sensitive) ed elimina il source';
