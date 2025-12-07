-- Seed default Bulgarian bill categories
INSERT INTO bill_categories (user_id, name, icon, color, is_default)
VALUES
  (NULL, 'Ток', 'flash', '#FFD700', true),
  (NULL, 'Парно', 'flame', '#FF6B6B', true),
  (NULL, 'Вода', 'water', '#4ECDC4', true),
  (NULL, 'Интернет', 'wifi', '#45B7D1', true),
  (NULL, 'Телефон', 'call', '#96CEB4', true),
  (NULL, 'Наем', 'home', '#FFEAA7', true),
  (NULL, 'Абонаменти', 'card', '#DDA0DD', true),
  (NULL, 'Данъци', 'document', '#98D8C8', true),
  (NULL, 'Други', 'ellipse', '#95A5A6', true)
ON CONFLICT DO NOTHING;
