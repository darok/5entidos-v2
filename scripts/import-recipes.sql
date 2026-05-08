-- =============================================================
-- Recetario v2 — recipe import
-- Generated from historial 5entidos - recetas_index.json
-- Run once in Supabase > SQL Editor
-- =============================================================

DO $$
DECLARE
  rid uuid;
  iid uuid;
BEGIN

  -- ── Ingredients ──────────────────────────────────────────────
  INSERT INTO ingredients (name) VALUES ('Carne de vaca') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Cebolla') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Caldo de verduras') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Paprika') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Comino') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Ajo en polvo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Sal') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Pimienta') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Crema de leche') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Spatzles o fideos') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Costillar de cerdo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Vinagre de vino') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Aceite de oliva') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Orégano') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Acelga') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Queso parmesano') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Mozzarella') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Queso semi-duro') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Harina') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Aceite de girasol') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Agua') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Pepino') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Azúcar') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Vinagre blanco') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Zanahoria') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Papa') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Coriandro') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Laurel') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Leche') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Pimienta negra') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Berenjena') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Sésamo tostado') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Champignones') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Salsa de soja') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Miel') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Vino blanco') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Morrón rojo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Nuez') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Aceto reducción') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Ajo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Palta') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Tomate') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Limón') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Jalapeño') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Muslos de pollo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Pechuga de pollo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Cebolla de verdeo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Caldo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Engrudo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Jengibre') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Curry') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Curcuma') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Crema de leche o leche de coco') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Jugo de naranja') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Romero') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Mollejas de garganta') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Arvejas') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Caldo de pollo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Pimentón') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Perejil') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Fideos cortos') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Calabaza') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Choclo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Queso crema') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Clara de huevo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Yema de huevo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Nuez moscada') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Harina o maicena') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Huevo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Condimentos varios') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Morrón verde') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Zuccini') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Tomillo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Tuco') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Provolone') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Albahaca') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Aceite') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Espinaca') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Ricota') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Queso rallado') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Avena') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Corn Flakes') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Almendras') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Semillas de girasol') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Manzana seca') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Pasas de uva') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Aceite de maíz') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Mejillones sin concha') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Caldo de pollo o verduras') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Zapallito') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Mendicream') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Polvo de hornear') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Panceta') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Queso gruyere') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Huevo duro') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Carne picada sin grasa') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Extracto de tomate') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Puré de tomate') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Caldo de carne o verdura') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Peceto') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Ciruelas pasas') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Jeréz') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Costillas de cerdo gruesas') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Arroz') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Aceite de sésamo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Ají molido') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Chocolinas') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Dulce de leche repostero') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Repollo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Vinagre de manzana') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Pimienta blanca') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Merluza triturada') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Cebolla frita') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Soda') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Pan rallado') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Tomate cherry') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Harina de matza') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Bicarbonato de sodio') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Pescado molido') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Naranja') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Manteca') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Levadura fresca') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Sésamo crudo') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Agua de azar') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Tahine') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Fécula de mandioca') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Carne') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Yogurt natural') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Baharat') ON CONFLICT (name) DO NOTHING;
  INSERT INTO ingredients (name) VALUES ('Clavo de olor') ON CONFLICT (name) DO NOTHING;

  -- ── Recipes ───────────────────────────────────────────────────
  -- Goulasch
  INSERT INTO recipes (title, servings)
    VALUES ('Goulasch', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Cortar la carne en cubos'),
    (rid, 2, 'Dorar a fuego fuerte en aceite y retirar (recomendable hacer de a partes para garantizar que se dore bien)'),
    (rid, 3, 'En la misma sarten dorar la cebolla hasta que esten doradas y retirar'),
    (rid, 4, 'En la misma sarten dorar las especias 2 minutos'),
    (rid, 5, 'Deglazar con whisky (opcional) y caldo, re-incorporar todos los ingredientes y agregar agua hasta cubrir'),
    (rid, 6, 'Condimentar y poner a fuego bajo por 1.5-3 horas'),
    (rid, 7, 'Agregar agua y/o espesar con engrudo de ser necesario'),
    (rid, 8, 'Agregar la crema (opcional)');

  SELECT id INTO iid FROM ingredients WHERE name = 'Carne de vaca';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Caldo de verduras';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Paprika';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Comino';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ajo en polvo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Crema de leche';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 80, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Spatzles o fideos';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 500, (SELECT id FROM units WHERE abbreviation = 'g'), false);

  -- Costillar de cerdo al horno
  INSERT INTO recipes (title, servings)
    VALUES ('Costillar de cerdo al horno', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Marinar el cerdo con todos los ingredientes (al menos 2 horas, ideal >4)'),
    (rid, 2, 'Cubrir con papel metalico y cocinar en horno a 220 grados durante 1 hora'),
    (rid, 3, 'Dejar 2 horas en el horno apagado (clave para que queden tiernas)'),
    (rid, 4, 'Retirar el papel metalico y volver a meter en horno a 220 grados 15 minutos');

  SELECT id INTO iid FROM ingredients WHERE name = 'Costillar de cerdo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Vinagre de vino';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite de oliva';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Paprika';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Comino';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 0.5, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ajo en polvo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Orégano';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cda'), false);

  -- Bohio Helueni
  INSERT INTO recipes (title, servings)
    VALUES ('Bohio Helueni', 36)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Mezclar los ingredientes de la masa'),
    (rid, 2, 'Dejar reposar en trozos medianos, embebida en aceite y con papel film por al menos 30 minutos'),
    (rid, 3, 'Sacar el nervio, lavar y cortar en trozos la acelga'),
    (rid, 4, 'Rallar los quesos y mezclar con la acelga'),
    (rid, 5, 'Probar punto de sal (no lleva sal por los quesos, pero probar por las dudas)'),
    (rid, 6, 'Poner la masa encima de (más) aceite, estirar bien y cortar en tiras largas de unos 4-5cm de ancho'),
    (rid, 7, 'Tomar un punado colmado de relleno, apretar bien, disponer en la masa y envolver bien rotando'),
    (rid, 8, 'Poner en placa de horno, pintar con (más!) aceite y echar queso rallado encima'),
    (rid, 9, 'Cocinar a horno 200°, revisando bien y de ser necesario rotando, subiendo la bandeja, etc. Estimado 1 hora de cocción.');

  SELECT id INTO iid FROM ingredients WHERE name = 'Acelga';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 6, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Queso parmesano';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 400, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Mozzarella';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 400, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Queso semi-duro';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 400, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Harina';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1.5, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite de girasol';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 350, (SELECT id FROM units WHERE abbreviation = 'ml'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Agua';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'l'), false);

  -- Pepino agridulce
  INSERT INTO recipes (title, servings)
    VALUES ('Pepino agridulce', 2)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Buscar la proporciòn deseada de agua, vinagre, sal y azùcar'),
    (rid, 2, 'Generar medio litro de esa mezcla'),
    (rid, 3, 'Cortar el pepino (con càscara) en rodajas bien delgadas y meter en la mezcla'),
    (rid, 4, 'Dejar macerar, alcanzar su màximo sabor luego de un par de dìas y se conserva hasta 2 semanas sin problemas');

  SELECT id INTO iid FROM ingredients WHERE name = 'Pepino';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Vinagre blanco';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Agua';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Puré de zanahoria
  INSERT INTO recipes (title, servings)
    VALUES ('Puré de zanahoria', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Cocer las papa en agua con sal y laurel'),
    (rid, 2, 'Cocer las zanahorias en poca agua (apenas cubriendo) con sal, laurel y azúcar'),
    (rid, 3, 'Colar y pisar la papa'),
    (rid, 4, 'Si quedó mucha agua en la zanahoria, sacar un poco'),
    (rid, 5, 'Procesar la zanahoria'),
    (rid, 6, 'Agregar la leche tibia y la papa'),
    (rid, 7, 'Condimentar con coriandro molido y ajustar sal, azúcar y pimienta negra');

  SELECT id INTO iid FROM ingredients WHERE name = 'Zanahoria';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 500, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Papa';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Coriandro';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Laurel';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Leche';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'ml'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta negra';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Puré de berenjenas
  INSERT INTO recipes (title, servings)
    VALUES ('Puré de berenjenas', 6)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Asar las berenjenas y la cebolla a fuego directo o al horno'),
    (rid, 2, 'Procesar las pulpas junto con un chorro de oliva y semillas de sésamo previamente tostadas'),
    (rid, 3, 'Corregir sal, pimienta y azúcar a gusto');

  SELECT id INTO iid FROM ingredients WHERE name = 'Berenjena';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite de oliva';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sésamo tostado';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta negra';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Salsa Dashi (a.k.a Champicrem)
  INSERT INTO recipes (title, servings)
    VALUES ('Salsa Dashi (a.k.a Champicrem)', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Cortar la cebolla en juliana y saltear en un poco de aceite'),
    (rid, 2, 'Agregar el champignon'),
    (rid, 3, 'Condimentar con azúcar (ocpinal) y sal a gusto'),
    (rid, 4, 'Agregar el vino (opc.) y dejar evaporar'),
    (rid, 5, 'Agregar la crema, salsa de soja y miel y dejar reducir'),
    (rid, 6, 'Si se desea que la salsa quede más espesa, preparar un engrudo con la harina e incorporar'),
    (rid, 7, 'Corregir con sal de ser necesario');

  SELECT id INTO iid FROM ingredients WHERE name = 'Champignones';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Crema de leche';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 50, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Salsa de soja';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Miel';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Vino blanco';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Harina';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);

  -- Mahamara
  INSERT INTO recipes (title, servings)
    VALUES ('Mahamara', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Asar el morrón a fuego directo o en el horno'),
    (rid, 2, 'Procesar junto con las nueces y aceite de olvia'),
    (rid, 3, 'Condimentar con azúcar (opcional) y sal a gusto'),
    (rid, 4, 'Opcional asar ajo junto a los morrones e incorporar'),
    (rid, 5, 'Echar un chorro de aceto reducción para balancear acidez (típicamente se usa melaza de granada)');

  SELECT id INTO iid FROM ingredients WHERE name = 'Morrón rojo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Nuez';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 8, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite de oliva';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceto reducción';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ajo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);

  -- Guacamole
  INSERT INTO recipes (title, servings)
    VALUES ('Guacamole', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Retirar la pulpa de las paltas y pisar bien con tenedor'),
    (rid, 2, 'Picar el tomate y la cebolla bien chico y mezclar con la palta'),
    (rid, 3, 'Agregar el jugo de limón, un chorro de aceite de oliva y luego agua hasta lograr la textura deseada');

  SELECT id INTO iid FROM ingredients WHERE name = 'Palta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 5, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Tomate';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 0.5, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Limón';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite de oliva';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Agua';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Dip de tomates
  INSERT INTO recipes (title, servings)
    VALUES ('Dip de tomates', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Pelar los tomates'),
    (rid, 2, 'Licuar junto con el jalapeño u otro picante en su ausencia');

  SELECT id INTO iid FROM ingredients WHERE name = 'Tomate';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Jalapeño';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Pollo al horno
  INSERT INTO recipes (title, servings)
    VALUES ('Pollo al horno', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Macerar el pollo en los condimentos por al menos 2 horas (ideal mas de 4); no olvidarse de condimentar debajo de la piel!'),
    (rid, 2, 'Salar con sal entrefina'),
    (rid, 3, 'Hornar por 50 minutos a 220 grados');

  SELECT id INTO iid FROM ingredients WHERE name = 'Muslos de pollo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 4, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite de oliva';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Pollo al verdeo con arroz
  INSERT INTO recipes (title, servings)
    VALUES ('Pollo al verdeo con arroz', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Freir la cebolla (agregando primero la comun, luego la parte blanca del verdeo y luego la parte verde y el ajo)'),
    (rid, 2, 'Agregar el pollo y saltear hasta que este cocido por fuera'),
    (rid, 3, 'Agregar el vino (opcional), medio caldo con minimo liquido necesario y la crema de leche'),
    (rid, 4, 'Cocinar por aproximadamente 10 minutos y de ser necesario espesar con engrudo');

  SELECT id INTO iid FROM ingredients WHERE name = 'Pechuga de pollo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla de verdeo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 500, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ajo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 3, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Crema de leche';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'ml'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Caldo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 0.5, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Vino blanco';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Engrudo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Pollo al curry con arroz
  INSERT INTO recipes (title, servings)
    VALUES ('Pollo al curry con arroz', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Poner el tomate en agua hirviendo por 1 min, retirar y pelar'),
    (rid, 2, 'Cortar en cubos pequenos y freir hasta que no tenga liquido y quede hecho pure'),
    (rid, 3, 'Dorar el pollo en aceite de olvia y girasol. Retirar y salar para que incorpore la sal.'),
    (rid, 4, 'Agregar la cebolla en la misma sarten'),
    (rid, 5, 'Agregar el ajo y el jengibre picados bien finos'),
    (rid, 6, 'Agregar el tomate hecho pure'),
    (rid, 7, 'Agregar las especias y dejar 2 minutos'),
    (rid, 8, 'Agregar el pollo, mezclar bien y dejar que se impregne el sabor'),
    (rid, 9, 'Agregar la leche de coco (original) o crema de leche (alternativa) o leche y un poco de engrudo (last resource)'),
    (rid, 10, 'Dejar cocinar 10 minutos'),
    (rid, 11, 'Corregir sal'),
    (rid, 12, 'Servir con arroz');

  SELECT id INTO iid FROM ingredients WHERE name = 'Pechuga de pollo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ajo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Jengibre';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 6, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Tomate';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Curry';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Comino';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 0.5, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Curcuma';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 0.5, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Crema de leche o leche de coco';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'ml'), false);

  -- Pollo a la naranja con arroz
  INSERT INTO recipes (title, servings)
    VALUES ('Pollo a la naranja con arroz', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Cortar las pechugas en trozos medianos y dejar remojar en el jugo de naranja (idealmente 2-4hs)'),
    (rid, 2, 'Sellar las pechugas con aceite de olvia'),
    (rid, 3, 'Retirarlas y salpimentar'),
    (rid, 4, 'Picar las cebollas y el ajo y dorarlas en la misma sarten'),
    (rid, 5, '(Opcional) licuar las cebollas y el ajo'),
    (rid, 6, 'Echar el jugo de naranja, azucar o miel, vino blanco y engrudo. Dejar reducir 5 minutos'),
    (rid, 7, 'Reincorporar las pechugas y corregir sal y pimienta'),
    (rid, 8, 'Servir con arroz');

  SELECT id INTO iid FROM ingredients WHERE name = 'Pechuga de pollo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Jugo de naranja';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 450, (SELECT id FROM units WHERE abbreviation = 'ml'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ajo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Jengibre';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Miel';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Salsa de soja';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Vino blanco';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Engrudo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Romero';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Guiso de mollejas
  INSERT INTO recipes (title, servings)
    VALUES ('Guiso de mollejas', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Cortar las mollejas en trozos pequenos y dorar bien en aceite de oliva y girasol (que se doren bien, no importa el tiempo)'),
    (rid, 2, 'Agregar la cebolla cortada en rectangulos medianos y la zanahoria tambien en cubos medianos'),
    (rid, 3, 'Una vez dorada la cebolla, agregar sal, pimienta, pimenton, oregano y 1 cucharadita de azucar'),
    (rid, 4, 'Agregar el morron y las arvejas y revolver'),
    (rid, 5, 'Agregar abundante vino blanco y medio cubo de caldo de pollo disuelto en una taza de agua'),
    (rid, 6, 'Dejar semi-tapado a fuego bajo por 30-60 minutos'),
    (rid, 7, 'Opcinal: agregar la papa cortada en cubos muy pequeños'),
    (rid, 8, 'Agregar crema de leche y dejar por 10-15 munutos más, hasta lograr textura deseada'),
    (rid, 9, 'Ratificar, sal, pimienta y si es necesario azúcar; agregar perejil'),
    (rid, 10, 'Cocinar los fideos aparte, mezclar y servir');

  SELECT id INTO iid FROM ingredients WHERE name = 'Mollejas de garganta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 750, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Morrón rojo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Zanahoria';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Arvejas';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 250, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Vino blanco';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Caldo de pollo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 0.5, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Crema de leche';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 100, (SELECT id FROM units WHERE abbreviation = 'ml'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimentón';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Orégano';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Perejil';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Fideos cortos';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 250, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Papa';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);

  -- Souffle de calabaza y choclo
  INSERT INTO recipes (title, servings)
    VALUES ('Souffle de calabaza y choclo', NULL)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Hervir la calabaza y los choclos'),
    (rid, 2, 'Pisar la calabaza y escurrir el puré'),
    (rid, 3, 'Batir las claras a punto nieve con una pizca de sal'),
    (rid, 4, 'Mezclar la calabaza con el choclo, las llemas, el queso crema, la maizena/harina'),
    (rid, 5, 'Agregar las claras a punto nieve con movimientos envolventes'),
    (rid, 6, 'Condimentar con sal, azúcar, pimienta y nuez moscada a gusto'),
    (rid, 7, 'Hornear a horno medio hasta que se dore la parte superior'),
    (rid, 8, 'Opcional: gratinar con queso muzzarella');

  SELECT id INTO iid FROM ingredients WHERE name = 'Calabaza';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1.5, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Choclo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Queso crema';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Clara de huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 4, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Yema de huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Nuez moscada';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Harina o maicena';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Mozzarella';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Spatzles
  INSERT INTO recipes (title, servings)
    VALUES ('Spatzles', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Mezclar la harina con el huevo y luego el resto de los ingredientes'),
    (rid, 2, 'Probar la textura: debe caer de la espatula pero ser bien viscosa (ajustar con harina o leche)'),
    (rid, 3, 'Calentar abundante agua con sal y asegurarse de que hierva agresivamente'),
    (rid, 4, 'Usar el llado inverso del rallador (agujeros grandes) para ir metiendo los spatzles (la mezcla no debe caer si no es empujada)'),
    (rid, 5, 'Los spatzles estan listos al flotar, lo cual sucede muy rapido');

  SELECT id INTO iid FROM ingredients WHERE name = 'Harina';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'taza'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Queso crema';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Leche';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 6, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Condimentos varios';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Terrina de vegetales
  INSERT INTO recipes (title, servings)
    VALUES ('Terrina de vegetales', 8)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Cortar la zanahoria en rodajas finas pequeñas, el morrón en tiras, la cebolla en pluma y el zuccini en cuartos pequeños'),
    (rid, 2, 'Hervir el choclo'),
    (rid, 3, 'Poner en una fuente con aceite las zanahorias, luego las cebollas, luego los morrones y último el zuccini'),
    (rid, 4, 'Agregar el choclo, pasar a un boul grande y dejar enfriar'),
    (rid, 5, 'Condimentar y agregar los huevos previamente batidos'),
    (rid, 6, 'Agregar el queso crema y luego la harina a ojo (aprox. 1 cuch)'),
    (rid, 7, 'Poner el molde/s y hornear a fuego medio hasta que esté firme (30-40 min)'),
    (rid, 8, 'Dejar reposar 10 minutos y servir');

  SELECT id INTO iid FROM ingredients WHERE name = 'Morrón rojo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Morrón verde';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Zanahoria';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Zuccini';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Choclo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 3, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Queso crema';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Harina o maicena';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Tomillo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimentón';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Melazzane alla parmiggiana
  INSERT INTO recipes (title, servings)
    VALUES ('Melazzane alla parmiggiana', 2)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Cortar las berenjenas en rodajas finas'),
    (rid, 2, 'Curar con un poco de sal gruesa por 1-2 horas, lavar y escurrir'),
    (rid, 3, 'Freir las berenjenas en abundante aceite a 180` (opc.: pasar por harina previamente) y secar exceso de aceite'),
    (rid, 4, 'Cortar la mozzarella en cubos pequeños'),
    (rid, 5, 'Pintar el fondo de la fuente con tuco'),
    (rid, 6, 'Poner una capa de berenjena'),
    (rid, 7, 'Condimentar con pimienta negra y albahaca'),
    (rid, 8, 'Poner queso provolone, cubos de mozzarella y muy poca salsa de tomate'),
    (rid, 9, 'Repetir las capas que se deseen (recomiendo entre 3 y 5)'),
    (rid, 10, 'Luego de la última capa de berenjenas poner mucha salsa y encima provolone y mozzarella para gratinar'),
    (rid, 11, 'Llevar a horno a 200° por 40 minutos'),
    (rid, 12, 'Dejar enfriar 10-20 minutos antes de servir');

  SELECT id INTO iid FROM ingredients WHERE name = 'Berenjena';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 500, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Tuco';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 250, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Mozzarella';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 35, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Provolone';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 100, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta negra';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Albahaca';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 250, (SELECT id FROM units WHERE abbreviation = 'g'), false);

  -- Malfatti de espinaca y ricota
  INSERT INTO recipes (title, servings)
    VALUES ('Malfatti de espinaca y ricota', 2)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Hervir la espinaca con sal gruesa 3 minutos'),
    (rid, 2, 'Dejar colar y escurrir'),
    (rid, 3, 'Picar y saltear la cebolla'),
    (rid, 4, 'Cortar la espinaca en trozos y agregar a la cebolla'),
    (rid, 5, 'Dejar a fuego bajo para que se evapore el agua de la espinaca'),
    (rid, 6, 'Retirar a un bowl e incorporar la ricota, la harina, el queso rallado y las llemas de huevo'),
    (rid, 7, 'Condimentar con nuez moscada, sal y pimienta'),
    (rid, 8, 'Realizar bolitas de a 3 a 4 cm de diametro'),
    (rid, 9, 'Pasarlos por harina para que no se peguen'),
    (rid, 10, 'Hervir en abundante agua con sal'),
    (rid, 11, 'Cuando flotan (1 o 2 min aprox.) retirar'),
    (rid, 12, 'Se recomienda servir con poco tuco');

  SELECT id INTO iid FROM ingredients WHERE name = 'Espinaca';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 600, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ricota';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 100, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Queso rallado';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 100, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Yema de huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Harina';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 100, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Nuez moscada';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Granola casera
  INSERT INTO recipes (title, servings)
    VALUES ('Granola casera', 6)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Golpear las almendras en el mortero para partir en trozos grandes (en 3 o 4)'),
    (rid, 2, 'Mezclar todos los ingredientes secos salvo las frutas secas'),
    (rid, 3, 'Hechas los ingredientes liquidos'),
    (rid, 4, 'Hornear por 20 minutos a 150°, revolviendo a la mitad'),
    (rid, 4, 'Agregar las frutas secas y hornear 2 minutos más'),
    (rid, 5, 'Dejar enfriear y guardar');

  SELECT id INTO iid FROM ingredients WHERE name = 'Avena';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 50, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Corn Flakes';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 40, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Almendras';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 50, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Semillas de girasol';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 40, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Manzana seca';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 20, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pasas de uva';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 50, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Miel';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 30, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite de maíz';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 10, (SELECT id FROM units WHERE abbreviation = 'g'), false);

  -- Mejillones a la provenzal
  INSERT INTO recipes (title, servings)
    VALUES ('Mejillones a la provenzal', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Picar los dientes de ajo bien pequenos'),
    (rid, 2, 'Rehogar en poco aceite por 1 minuto'),
    (rid, 3, 'Agregar los mejillones y cocinar por 2 minutos'),
    (rid, 4, 'Agregar el vino y el perejil y cocinar 5 minutos mas'),
    (rid, 5, 'Condimentar con poca sal y un poco de azúcar para contrarestar la acidez del vino'),
    (rid, 6, 'Agregar engrudo para espesar la salsa a gusto');

  SELECT id INTO iid FROM ingredients WHERE name = 'Mejillones sin concha';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 350, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ajo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 4, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Perejil';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Vino blanco';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'ml'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Engrudo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Pollo al champignon
  INSERT INTO recipes (title, servings)
    VALUES ('Pollo al champignon', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Cortar los champignones en juliana y la cebolla picada fina'),
    (rid, 2, 'Dorar los muslos en sartén (sin piel), retirar y salar'),
    (rid, 3, 'Retirar la grasa de la sartén pero dejar el dorado en el fondo'),
    (rid, 4, 'Incorporar los champignones y la cebollla y dorar'),
    (rid, 5, 'Agregar los ajos'),
    (rid, 6, 'Echar el vino y dejar reducir'),
    (rid, 7, 'Agregar el caldo y (opcionalmente) la crema'),
    (rid, 8, 'Volver a agregar los pollos con su jugo y cocinar 15 a 20 minutos'),
    (rid, 9, 'Condimentar a gusto (mucha pimienta) y espesar con engrudo a gusto');

  SELECT id INTO iid FROM ingredients WHERE name = 'Muslos de pollo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 4, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Champignones';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ajo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 3, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Vino blanco';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'ml'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Caldo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta negra';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Engrudo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Pollo al jengibre
  INSERT INTO recipes (title, servings)
    VALUES ('Pollo al jengibre', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Cortar las pechugas en trozos tipo "submarino" de "un dedo de largo"'),
    (rid, 2, 'Poner en un bowl con el jengibre rallado, salsa de soja y miel'),
    (rid, 3, 'Tapar y dejar en la heladera por 3-4 horas'),
    (rid, 4, 'Dorar el pollo en aceite a fuego máximo 3-5 minutos'),
    (rid, 5, 'Retirar el pollo y parte del aceite'),
    (rid, 6, 'Incorporar la mezcla donde se maceró el pollo y el caldo'),
    (rid, 7, 'Espesar la salsa (de ser necesario usar una cucharada de engrudo) - debe quedar bastante salsa'),
    (rid, 8, 'Incorporar el pollo y cocinar unos minutos más hasta que se cocine (pero no se pase)'),
    (rid, 9, 'Se recomienda acompañar con arroz blanco');

  SELECT id INTO iid FROM ingredients WHERE name = 'Pechuga de pollo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Jengibre';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 50, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Miel';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 70, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Salsa de soja';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 20, (SELECT id FROM units WHERE abbreviation = 'ml'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Caldo de pollo o verduras';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'l'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Harina';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cda'), false);

  -- Budín de zapallitos
  INSERT INTO recipes (title, servings)
    VALUES ('Budín de zapallitos', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Rallar el zapallito con rallador. Escuirr lo más posible (dejar en colador con peso arriba).'),
    (rid, 2, 'Agregar el Mendicream, harina, queso rallado y los huevos'),
    (rid, 3, 'Condimentar con sal, pimienta y nuez moscada'),
    (rid, 4, 'Llevar a horno 180° por 50 minutos'),
    (rid, 5, 'Terminar a horno fuerte 5 minutos para que se dore (cuidado que no se pase y se forme una costra dura!)');

  SELECT id INTO iid FROM ingredients WHERE name = 'Zapallito';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1.5, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Harina';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 40, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Mendicream';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2.5, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Queso rallado';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Nuez moscada';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Polvo de hornear';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1.5, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);

  -- Champignones rellenos
  INSERT INTO recipes (title, servings)
    VALUES ('Champignones rellenos', 3)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Lavar los hongos, retirar los cabos (conservarlos)'),
    (rid, 2, 'Saltear la cebolla'),
    (rid, 3, 'Incorporar la panceta y dejar dorar'),
    (rid, 4, 'Imcorporar los cabos de los hongos cortados bien pequeños'),
    (rid, 5, 'Agregar crema, pimienta y dejar a fuego fuerte hasta que reduzca'),
    (rid, 6, 'Agregar el queso rallado'),
    (rid, 7, 'Cocinar los hongos en horno a 180° por 8 minutos'),
    (rid, 8, 'Sacar y retirar el líquido que hayan soltado'),
    (rid, 9, 'Agregar el relleno, queso arriba para gratinar y poner a horno fuerte 5 minutos');

  SELECT id INTO iid FROM ingredients WHERE name = 'Champignones';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 9, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Panceta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 100, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Queso gruyere';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Crema de leche';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 150, (SELECT id FROM units WHERE abbreviation = 'ml'), false);

  -- Ensalada Sandra
  INSERT INTO recipes (title, servings)
    VALUES ('Ensalada Sandra', 15)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Picar las cebollas y caramelizarlas bien bien'),
    (rid, 2, 'Agregar azúcar para mayor dulzor y dejar unos minutos más'),
    (rid, 3, 'Pelar los huevos duros y rallarlos con abertura media'),
    (rid, 4, 'Dejar enffriar y mezclar'),
    (rid, 5, 'Agregar sal y de ser necesario más azúcar');

  SELECT id INTO iid FROM ingredients WHERE name = 'Huevo duro';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 18, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Morrones rellenos
  INSERT INTO recipes (title, servings)
    VALUES ('Morrones rellenos', 3)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Picar la cebolla y el zuccini bien pequeños (retirar el centro)'),
    (rid, 2, 'Rallar la zanahoria'),
    (rid, 3, 'Dorar la cebolla'),
    (rid, 4, 'Agregar la carne picada'),
    (rid, 5, 'Una vez cocida, agregar las verduras'),
    (rid, 6, 'Agregar el caldo, los condimentos y 1/4 del extracto de tomate'),
    (rid, 7, 'Dejar enfriar'),
    (rid, 8, 'Limpiar los morrones y rellenarlos'),
    (rid, 9, 'Mezclar el puré de tomate, el resto del extracto, un poco de azúcar y provenzal seca'),
    (rid, 10, 'Poner la salsa, los morones al horno 30 minutos, fuego medio');

  SELECT id INTO iid FROM ingredients WHERE name = 'Morrón rojo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 3, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Carne picada sin grasa';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 500, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Zuccini';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Zanahoria';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Extracto de tomate';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Puré de tomate';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Caldo de carne o verdura';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);

  -- Peceto relleno
  INSERT INTO recipes (title, servings)
    VALUES ('Peceto relleno', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Mechar el peceto con ciruelas pasas (opcional panceta)'),
    (rid, 2, 'Envolver en papel aluminio y rociar con miel, jeréz, sal y pimienta'),
    (rid, 3, 'Cocinar a horno lento por 1 hora'),
    (rid, 4, 'Esperar 20 minutos y abrir el papel aluminio');

  SELECT id INTO iid FROM ingredients WHERE name = 'Peceto';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ciruelas pasas';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Panceta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Miel';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Jeréz';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Costillas a la arveja
  INSERT INTO recipes (title, servings)
    VALUES ('Costillas a la arveja', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Salar las costillas con sal entrefina'),
    (rid, 2, 'Calentar la parrilla a fuego fuerte, dorar las costillas de ambos lados y retirar (opc: fritrar con aceite)'),
    (rid, 3, 'Saltear la cebolla y el morrón con un poco de aceite de oliva'),
    (rid, 4, 'Agregar el ajo triturado'),
    (rid, 5, 'Agregar el vino y el caldo diluído en un poco de agua; dejar evaporar el alcohol del vino'),
    (rid, 6, 'Condimentar con pimienta, orégano, perejil'),
    (rid, 7, 'Incorporar las costillas junto con el jugo que hayan soltado'),
    (rid, 8, 'Cubir con agua, tapar, bajar fuego a medio/bajo y dejar cocinar por 1-2 horas'),
    (rid, 9, 'Agregar las arvejas, cocinar durante 15 minutos más'),
    (rid, 10, 'Corregir condimento y servir'),
    (rid, 11, 'GUARNICIÓN: Se recomiendan papas en cubo al horno, o alternativamente arroz');

  SELECT id INTO iid FROM ingredients WHERE name = 'Costillas de cerdo gruesas';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 4, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Morrón rojo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Arvejas';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Vino blanco';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 150, (SELECT id FROM units WHERE abbreviation = 'ml'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Caldo de verduras';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 0.5, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ajo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 3, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Orégano';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Perejil';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Souffle de huevos
  INSERT INTO recipes (title, servings)
    VALUES ('Souffle de huevos', 2)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Separar las llemas de las claras'),
    (rid, 2, 'Llemas: incorporar una pizca de sal y una cucharadita de azúcar; batir'),
    (rid, 3, 'Claras: incorporar una pizca de sal y dos cucharaditas de azúcar; batir a nieve'),
    (rid, 4, 'Calentar una satén (con tapa, o idealmente doble tipo tortilla)'),
    (rid, 5, 'Echar las llemas, extender y dejar cocinar brevemente hasta que estén levemente cocidas'),
    (rid, 6, 'Bajar el fuego a mínimo, incoporar las claras, dar forma con una espátula'),
    (rid, 7, 'Tapar la sartén y cocinar por 5 minutos'),
    (rid, 8, 'GUARNICIÓN: Se recomienda comer con ensalada'),
    (rid, 9, 'OPCION: Echar un poco de miel');

  SELECT id INTO iid FROM ingredients WHERE name = 'Huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 3, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 3, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'pizca'), false);

  -- Yakimeshi
  INSERT INTO recipes (title, servings)
    VALUES ('Yakimeshi', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Cortar la zanahoria en cubos muy pequeños (2-3mm)'),
    (rid, 2, 'Cortar la cebolla de verdeo muy pequeña, separando lo verde de lo blanco'),
    (rid, 3, 'Lavar bien el arroz y poner a cocinar con poca sal y doble volumen de agua (opc: laurel)'),
    (rid, 4, 'Poner abundante aceite y saltear la zanahoria 3 minutos'),
    (rid, 5, 'Agregar la parte blanca de la cebolla y saltear otros 3 minutos'),
    (rid, 6, 'Hacer a un lado las verduras'),
    (rid, 7, 'Hechar los huevos en el aceite y cocinar muy poco tiempo y revolviendo cada tanto'),
    (rid, 8, 'Cortar el huevo pequeño con la cuchara y mezclar con las verduras'),
    (rid, 9, 'Para este momento debiera estar listo el arroz: agregarlo y saltear 2 minutos'),
    (rid, 10, 'Agregar a gusto salsa de soja, aceite de sésamo'),
    (rid, 11, 'Condimentar con pimienta y ají molido'),
    (rid, 12, 'Opcional: saltear pollo o camarones con aceite y soja y unas gotas de aceite de sésamo (tori / umi yakimeshi)');

  SELECT id INTO iid FROM ingredients WHERE name = 'Arroz';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'taza'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Zanahoria';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 500, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla de verdeo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 350, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 5, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite de girasol';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Salsa de soja';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite de sésamo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ají molido';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Chocotorta
  INSERT INTO recipes (title, servings)
    VALUES ('Chocotorta', 20)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'TIP #1: Las galletitas deben quedan MUY húmedas'),
    (rid, 2, 'TIP #2: Arriba va una capa muy fina de mezcla y luego polvo de chocolina triturada');

  SELECT id INTO iid FROM ingredients WHERE name = 'Chocolinas';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 80, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Chocolinas';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 10, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Dulce de leche repostero';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 800, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Mendicream';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1.5, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Leche';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Falso Chucrut
  INSERT INTO recipes (title, servings)
    VALUES ('Falso Chucrut', 6)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'NOTA: Si se usa repollo blanco (Sauerkraut) se suele hacer agri-salado, si se usa colorado (Rotkhol) más dulce más agrio y salado'),
    (rid, 2, 'Sacar las hojas sucias del repollo'),
    (rid, 3, 'Cortar en juliana lo más fino posible'),
    (rid, 4, 'Poner en una olla o sartén bien grande abundante aceite'),
    (rid, 5, 'Echar el repollo de a partes (crudo es mucho volúmen) e ir revolviendo'),
    (rid, 6, 'Cuando haya partes doradas, pero sin quemarse, hechar abundante vinagre, sal y azúcar'),
    (rid, 7, 'Dejar cocinar a fuego medio-alto hasta que se evapore el líquido, revolviendo cada tanto'),
    (rid, 8, 'Bajar el fuego a medio-bajo, ajustar sazón y seguir cocinando, revolviendo más seguido'),
    (rid, 9, 'Suele estar 30-60 minutos (cuanto más se cocine más seco y concentrado el sabor quedará)'),
    (rid, 10, 'Ajustar la sazón una última vez, agregando también pimiento negra y pimienta blanca'),
    (rid, 11, 'Apagar el fuego e inclinar la olla para quitar la mayor cantidad de aceite posible antes de guardar'),
    (rid, 12, 'NOTA: Las cantidades de vinagre, sal y azúcar son la clave de la receta'),
    (rid, 13, 'NOTA: Si se usa repollo blanco (Sauerkraut) se suele hacer agri-salado, si se usa colorado (Rotkhol) más dulce más agrio y salado');

  SELECT id INTO iid FROM ingredients WHERE name = 'Repollo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Vinagre de manzana';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta negra';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta blanca';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Guefilte Fish
  INSERT INTO recipes (title, servings)
    VALUES ('Guefilte Fish', 6)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Mezclar todos los ingredientes'),
    (rid, 2, 'Hacer croquetas de 10cm x 5cm x 3cm redondeadas (tipo pastillas de jabón)'),
    (rid, 3, 'Freir en aceite para dorar de ambos lados'),
    (rid, 4, 'Llevar a un caldo con 2 zanahorias y terminar de cocinar'),
    (rid, 5, 'Guardar el pescado sin caldo (seco) y un tupper pequeño con caldo para el momento de servir');

  SELECT id INTO iid FROM ingredients WHERE name = 'Merluza triturada';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 150, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla frita';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 150, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Soda';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pan rallado';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 120, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Zanahoria';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);

  -- Milanesa de berenjena quemada
  INSERT INTO recipes (title, servings)
    VALUES ('Milanesa de berenjena quemada', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Hornear las berenjenas con las cabezas de ajo y tomates cherry, con aceite de oliva'),
    (rid, 2, 'Pelar las berenjenas (dejar el cabo), aplastar un poco y condimentar (sal, pimienta)'),
    (rid, 3, 'Hacer las 3 mezclas de rebozado (harina; huevo batido; pan rallado con especias)'),
    (rid, 4, 'Pasar por la harina, el huevo, el pan rallado'),
    (rid, 5, 'Freir en aceite'),
    (rid, 6, 'Hacer la salsa con los cherry, ajos, condimentos y pasar por una mini-pymer');

  SELECT id INTO iid FROM ingredients WHERE name = 'Berenjena';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 4, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite de oliva';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 4, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Harina';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 50, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 3, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pan rallado';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 150, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Perejil';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Paprika';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Tomate cherry';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 500, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ajo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Albahaca';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 6, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Kneidalaj
  INSERT INTO recipes (title, servings)
    VALUES ('Kneidalaj', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Mezclar todo'),
    (rid, 2, 'Dejar reposar en la heladera ~30min'),
    (rid, 3, 'Hacer bolitas de ~3cm de diámetro'),
    (rid, 4, 'Cocinar idealmente en caldo, si no en agua, durante 15 minutos'),
    (rid, 5, 'Servir con sopa, tuco o guiso');

  SELECT id INTO iid FROM ingredients WHERE name = 'Harina de matza';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 220, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 6, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Bicarbonato de sodio';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite de girasol';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 0.5, (SELECT id FROM units WHERE abbreviation = 'taza'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Soda';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 0.5, (SELECT id FROM units WHERE abbreviation = 'taza'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Perejil';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Caldo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Croquetas de pescado "Bernarda"
  INSERT INTO recipes (title, servings)
    VALUES ('Croquetas de pescado "Bernarda"', 8)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Cocinar la calabaza al horno y hervir las papas'),
    (rid, 2, 'Mezclar el pescado, calabaza y papa hechas puré'),
    (rid, 3, 'Agregar sal y pimienta a gusto'),
    (rid, 4, '(Opcional) Dejar enfriar en heladera para que sea más fácil formar las bolas'),
    (rid, 5, 'Formar bolas de unos 4-5cm de diámetro, pasar por huevo y por harina'),
    (rid, 6, 'Freir en aceite rotando hasta que estén doradas y el pescado cocido');

  SELECT id INTO iid FROM ingredients WHERE name = 'Pescado molido';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Calabaza';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 500, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Papa';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 350, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Harina';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 150, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Pollo a la naranja
  INSERT INTO recipes (title, servings)
    VALUES ('Pollo a la naranja', 6)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Cortar el pollo en lomitos largos y finos'),
    (rid, 2, 'Sellar el pollo con aceite'),
    (rid, 3, 'Retirar el pollo y dorar la cebolla en juliana, y el ajo picado'),
    (rid, 4, 'Incorporar vino blanco, reducir'),
    (rid, 5, 'Incorporar jugo de naranja y miel'),
    (rid, 6, 'Dejar reducir levemente, si es necesario espesar con harina o manteca'),
    (rid, 7, 'Volver a incorporar el pollo y sus jugos'),
    (rid, 8, 'Acompañar con arroz blanco');

  SELECT id INTO iid FROM ingredients WHERE name = 'Pechuga de pollo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1.2, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 300, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ajo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Vino blanco';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'taza'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Naranja';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1.5, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Miel';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 3, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Milhojas de papa
  INSERT INTO recipes (title, servings)
    VALUES ('Milhojas de papa', 8)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Pelar la papa y cortar fino (idealmente con madolina)'),
    (rid, 2, 'Condimentar y echar la manteca derretida'),
    (rid, 3, 'En otro bowl poner la crema, 2 yemas de huevo y sal'),
    (rid, 4, 'Armar en una fuente el milhojas con una capa de papas en caracol, untar la crema y queso rallado'),
    (rid, 5, 'Repetir hasta utilizar todo, terminando con queso rallado por arriba'),
    (rid, 6, 'Hornear a 180° por 30-40 minutos (las papas deben quedar blandas y por arriba bien dorado)');

  SELECT id INTO iid FROM ingredients WHERE name = 'Papa';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1.5, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Manteca';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 300, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Crema de leche';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 600, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Naranja';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1.5, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Miel';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 3, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Queso rallado';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'g'), false);

  -- Pollo a la crema de espinaca
  INSERT INTO recipes (title, servings)
    VALUES ('Pollo a la crema de espinaca', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Dorar las pechugas'),
    (rid, 2, 'Retirar y poner las cebollas a rehogar'),
    (rid, 3, 'Echar la crema y la espinaca, cocinar hasta espesar la crema'),
    (rid, 4, 'Volver a poner las pechugas y cocinar bien (que no se pasen)'),
    (rid, 5, 'Se recomienda servir con fideo tipo farfalej');

  SELECT id INTO iid FROM ingredients WHERE name = 'Pechuga de pollo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Espinaca';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 3, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Crema de leche';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 200, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pimienta';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Jalá
  INSERT INTO recipes (title, servings)
    VALUES ('Jalá', 2)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Mezclar todos los ingredientes'),
    (rid, 2, 'Amasar en potencia 3-5 por unos 3 min - de ser neceseario agregar 10-20g más de harina'),
    (rid, 3, 'Separar en 6 bollos de igual peso (para 2 jalót - REF: jalá original eran 200g cada bollo)'),
    (rid, 4, 'Hacer bollos, luego tubos, luego trenzar (ver que no queden agujeros)'),
    (rid, 5, 'Dejar leudando en bandeja arriba de horno prendido'),
    (rid, 6, 'Poner huevo y sésamo arriba'),
    (rid, 7, 'Horno eléctrico a 200° por 28-30 min (controlar con cuchillo)'),
    (rid, 8, 'Dejar enfriar y poner el almibar, saborizador con limón y agua de azar');

  SELECT id INTO iid FROM ingredients WHERE name = 'Harina';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 500, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 75, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite de girasol';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 50, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Huevo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 0.5, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Levadura fresca';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 25, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Agua';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 300, (SELECT id FROM units WHERE abbreviation = 'ml'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sésamo crudo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Agua';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 50, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Aceite';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 50, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Agua de azar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Limón';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'c/n'), false);

  -- Babaganush
  INSERT INTO recipes (title, servings)
    VALUES ('Babaganush', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Asar las berenjenas a fuego directo'),
    (rid, 2, 'Enfirar en una bolsa, sacar la pulpa'),
    (rid, 3, 'Mezclar con todos los ingredientes y procesar'),
    (rid, 4, 'Rectificar sal y azucar');

  SELECT id INTO iid FROM ingredients WHERE name = 'Berenjena';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Ajo';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Limón';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, NULL, (SELECT id FROM units WHERE abbreviation = 'u'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Tahine';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 2, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);

  -- Mbejú
  INSERT INTO recipes (title, servings)
    VALUES ('Mbejú', 2)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Colocar la fécula en un bowl y el resto'),
    (rid, 2, 'Colocar la leche de a poco y mezclar, debe quedar arenado'),
    (rid, 3, 'Tirar en sartén muy claiente con fritolin, aplastar para dejar como una tortilla finita'),
    (rid, 4, 'Cocinar 2 min de cada lado');

  SELECT id INTO iid FROM ingredients WHERE name = 'Fécula de mandioca';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 250, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 5, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Manteca';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 40, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Mozzarella';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 150, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Queso semi-duro';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 75, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Leche';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 75, (SELECT id FROM units WHERE abbreviation = 'ml'), false);

  -- Shawarma de carne
  INSERT INTO recipes (title, servings)
    VALUES ('Shawarma de carne', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Corte de carne: puede ser lomo o bien un roast beef sin grasa'),
    (rid, 2, 'Revolver todos los ingredientes'),
    (rid, 3, 'Macerar de un día para el otro (o mínimo 4 horas)'),
    (rid, 4, 'Cocinar incluyendo la salsa hasta que se reduzca y dore la carne');

  SELECT id INTO iid FROM ingredients WHERE name = 'Carne';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Yogurt natural';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 5, (SELECT id FROM units WHERE abbreviation = 'cda'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Paprika';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Baharat';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Comino';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Coriandro';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Clavo de olor';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 0.5, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);

  -- Latkes de papa y cebolla
  INSERT INTO recipes (title, servings)
    VALUES ('Latkes de papa y cebolla', 4)
    RETURNING id INTO rid;

  INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES
    (rid, 1, 'Pelar y rallar la papa'),
    (rid, 2, 'Escurrir en una tela con mucha fuerza - reservar el agua'),
    (rid, 3, 'Repetir con la cebolla'),
    (rid, 4, 'Descartar el agua de las papas y conservar el almidón que decantó al fondo'),
    (rid, 5, 'Agregar 3 huevos a este almidón y batir'),
    (rid, 6, 'Mezclar la papa y la cebolla, agregar la harina y pan rallado y sal'),
    (rid, 7, 'Agregar la mezcla de huevo y almidón de a poco, solo lo necesario para que se formen las bolas - tirar el resto'),
    (rid, 8, 'Formar bolas de 60g cada una'),
    (rid, 9, 'Freir en aceite medio así se llega a cocinar (aplastar levemente la bola para dar forma) - cocinar 4 min de cada lado');

  SELECT id INTO iid FROM ingredients WHERE name = 'Papa';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'kg'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Cebolla';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 500, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Pan rallado';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 40, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Harina';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 10, (SELECT id FROM units WHERE abbreviation = 'g'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Sal';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 1, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);
  SELECT id INTO iid FROM ingredients WHERE name = 'Azúcar';
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, optional)
    VALUES (rid, iid, 0.5, (SELECT id FROM units WHERE abbreviation = 'cdta'), false);

END;
$$;
