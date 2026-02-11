/*
  # Enable Realtime for Slider Items

  1. Enable realtime replication for slider_items table
    - This allows the HeroSlider component to update automatically when data changes
*/

-- Enable realtime for slider_items table
ALTER PUBLICATION supabase_realtime ADD TABLE slider_items;