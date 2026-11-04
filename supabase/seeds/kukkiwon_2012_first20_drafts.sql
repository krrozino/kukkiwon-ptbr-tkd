-- Kukkiwon 2012: primeiro lote de 20 registros verificados no documento.
-- Tradução pt-BR provisória; não publicado. Reexecutável (on conflict do nothing).
begin;
insert into public.content_sources (institution,title,edition,publication_year,official_url)
select 'Kukkiwon','Taekwondo Technical Terminology','English edition, preface 2012',2012,'https://research.kukkiwon.or.kr/homepage/boardMedia/11621'
where not exists (select 1 from public.content_sources where official_url='https://research.kukkiwon.or.kr/homepage/boardMedia/11621');
insert into public.technical_terms (slug,category,romanization,hangul,translation_pt,definition_pt,editorial_status,publication_status)
select v.slug,v.category,v.romanization,v.hangul,v.translation_pt,v.definition_pt,'document_checked','draft'
from (values
('an-chagi','chute','An-chagi','안차기','Chute para dentro','Chute cuja trajetória segue da parte externa para dentro.'),
('ap-chagi','chute','Ap-chagi','앞차기','Chute frontal','Chute dirigido à frente com extensão da perna.'),
('bakkat-chagi','chute','Bakkat-chagi','바깥차기','Chute para fora','Chute cuja trajetória segue da parte interna para fora.'),
('dollyeo-chagi','chute','Dollyeo-chagi','돌려차기','Chute circular','Chute que envolve rotação do quadril e da perna de apoio.'),
('yeop-chagi','chute','Yeop-chagi','옆차기','Chute lateral','Chute realizado com o corpo voltado lateralmente.'),
('apgubi','base','Apgubi','앞굽이','Base com peso à frente','Base que concentra mais peso sobre a perna dianteira.'),
('ap-seogi','base','Ap-seogi','앞서기','Base de caminhada','Base organizada como um passo à frente.'),
('dwitgubi','base','Dwitgubi','뒷굽이','Base com peso atrás','Base que concentra mais peso sobre a perna posterior.'),
('juchum-seogi','base','Juchum-seogi','주춤서기','Base do cavaleiro','Base com pés paralelos e joelhos flexionados.'),
('moa-seogi','base','Moa-seogi','모아서기','Base de pés unidos','Base com bordas internas dos pés juntas.'),
('narani-seogi','base','Narani-seogi','나란히서기','Base paralela','Base com pés paralelos e joelhos estendidos.'),
('an-makgi','defesa','An-makgi','안막기','Defesa para dentro','Defesa deslocada da parte externa para dentro do corpo.'),
('bakkat-makgi','defesa','Bakkat-makgi','바깥막기','Defesa para fora','Defesa deslocada da parte interna para fora do corpo.'),
('naeryeo-makgi','defesa','Naeryeo-makgi','내려막기','Defesa descendente','Defesa com movimento dirigido de cima para baixo.'),
('ollyeo-makgi','defesa','Ollyeo-makgi','올려막기','Defesa ascendente','Defesa que se desloca de baixo para cima.'),
('batangson','regiao-corporal','Batangson','바탕손','Base da palma da mão','Parte inferior da palma usada como superfície de contato.'),
('jumeok','regiao-corporal','Jumeok','주먹','Punho fechado','Mão fechada, com a região frontal usada em golpes.'),
('sonbadak','regiao-corporal','Sonbadak','손바닥','Palma da mão','Face interna da mão, entre os dedos e o punho.'),
('sonnal','regiao-corporal','Sonnal','손날','Borda externa da mão','Borda da mão localizada no lado do dedo mínimo.'),
('sonnaldeung','regiao-corporal','Sonnaldeung','손날등','Borda interna da mão','Borda da mão localizada no lado do polegar.')
) as v(slug,category,romanization,hangul,translation_pt,definition_pt)
on conflict (slug) do nothing;
insert into public.term_sources(term_id,source_id,source_locator,checked_at)
select t.id,s.id,v.locator,now()
from (values
('an-chagi','§1 Chagi > An-chagi'),
('ap-chagi','§1 Chagi > Ap-chagi'),
('bakkat-chagi','§1 Chagi > Bakkat-chagi'),
('dollyeo-chagi','§1 Chagi > Dollyeo-chagi'),
('yeop-chagi','§1 Chagi > Yeop-chagi'),
('apgubi','§15 Seogi > Apgubi'),
('ap-seogi','§15 Seogi > Ap-seogi'),
('dwitgubi','§15 Seogi > Dwitgubi'),
('juchum-seogi','§15 Seogi > Juchum-seogi'),
('moa-seogi','§15 Seogi > Moa-seogi'),
('narani-seogi','§15 Seogi > Narani-seogi'),
('an-makgi','§10 Makgi > An-makgi'),
('bakkat-makgi','§10 Makgi > Bakkat-makgi'),
('naeryeo-makgi','§10 Makgi > Naeryeo-makgi'),
('ollyeo-makgi','§10 Makgi > Ollyeo-makgi'),
('batangson','Appendix > Applicable Parts of the Body > Batangson'),
('jumeok','Appendix > Applicable Parts of the Body > Jumeok'),
('sonbadak','Appendix > Applicable Parts of the Body > Sonbadak'),
('sonnal','Appendix > Applicable Parts of the Body > Sonnal'),
('sonnaldeung','Appendix > Applicable Parts of the Body > Sonnaldeung')
) as v(slug,locator)
join public.technical_terms t on t.slug=v.slug
join public.content_sources s on s.official_url='https://research.kukkiwon.or.kr/homepage/boardMedia/11621'
on conflict (term_id,source_id,source_locator) do nothing;
commit;
