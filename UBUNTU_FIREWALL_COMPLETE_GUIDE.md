# 🔐 دليل Ubuntu وإعدادات Firewall الكاملة

## 1️⃣ نظام التشغيل الموصى به

### ✅ نعم، Ubuntu Linux صحيح

```yaml
Operating System: Ubuntu Server
Version الموصى بها: Ubuntu 22.04 LTS (Jammy Jellyfish)
Version البديلة: Ubuntu 24.04 LTS (Noble Numbat)
Architecture: 64-bit (x86_64 or AMD64)
```

### لماذا Ubuntu 22.04 LTS؟

```
✅ LTS = Long Term Support (دعم 5 سنوات)
✅ مستقر وآمن جداً
✅ تحديثات أمنية منتظمة حتى 2027
✅ متوافق مع جميع أدواتنا (PostgreSQL, Nginx, Node.js, etc)
✅ سهل الإدارة
✅ مجاني 100%
```

---

## 2️⃣ معلومات الإصدار

### Ubuntu 22.04 LTS (الموصى به):
```yaml
Version: 22.04.4 LTS
Codename: Jammy Jellyfish
Release Date: April 2022
End of Support: April 2027 (5 years)
Kernel: Linux 5.15+
```

### Ubuntu 24.04 LTS (الأحدث):
```yaml
Version: 24.04 LTS
Codename: Noble Numbat
Release Date: April 2024
End of Support: April 2029 (5 years)
Kernel: Linux 6.8+
```

**توصيتي: استخدم Ubuntu 22.04 LTS** (أكثر استقراراً واختباراً)

---

## 3️⃣ Firewall: UFW (Uncomplicated Firewall)

### ما هو UFW؟
```
UFW = Uncomplicated Firewall
- Firewall بسيط وسهل الاستخدام
- مدمج في Ubuntu
- واجهة سهلة لـ iptables
```

---

## 4️⃣ Firewall Rules الكاملة (للعميل)

### 📋 خطوات الإعداد الكاملة:

```bash
# ─────────────────────────────────────────────
# الخطوة 1: تثبيت UFW (مثبت افتراضياً)
# ─────────────────────────────────────────────
sudo apt update
sudo apt install ufw -y

# ─────────────────────────────────────────────
# الخطوة 2: إعداد القواعد الأساسية (Default Policies)
# ─────────────────────────────────────────────

# رفض كل الوارد (Incoming) - افتراضياً
sudo ufw default deny incoming

# السماح بكل الصادر (Outgoing) - للتحديثات والخدمات
sudo ufw default allow outgoing

# ─────────────────────────────────────────────
# الخطوة 3: السماح بـ SSH (⚠️ مهم جداً قبل تفعيل UFW!)
# ─────────────────────────────────────────────

# الطريقة 1: السماح من كل مكان (مؤقتاً)
sudo ufw allow 22/tcp

# الطريقة 2: السماح من IP محدد فقط (✅ الأفضل للأمان)
sudo ufw allow from YOUR_OFFICE_IP to any port 22
# مثال:
# sudo ufw allow from 123.45.67.89 to any port 22

# الطريقة 3: السماح من نطاق IPs
# sudo ufw allow from 123.45.67.0/24 to any port 22

# ─────────────────────────────────────────────
# الخطوة 4: السماح بـ HTTP و HTTPS
# ─────────────────────────────────────────────

# Port 80 (HTTP)
sudo ufw allow 80/tcp

# Port 443 (HTTPS)
sudo ufw allow 443/tcp

# أو استخدم:
sudo ufw allow 'Nginx Full'    # يسمح بـ 80 و 443

# ─────────────────────────────────────────────
# الخطوة 5: تفعيل UFW
# ─────────────────────────────────────────────

sudo ufw enable

# تأكيد: اضغط 'y' ثم Enter

# ─────────────────────────────────────────────
# الخطوة 6: التحقق من الإعدادات
# ─────────────────────────────────────────────

# عرض الحالة
sudo ufw status verbose

# عرض القواعد برقم
sudo ufw status numbered
```

---

## 5️⃣ Firewall Rules النهائية (Full Configuration)

### 🔐 الإعداد الكامل المطلوب:

```bash
#!/bin/bash
# ══════════════════════════════════════════════════════
# إعداد Firewall الكامل للمشروع
# ══════════════════════════════════════════════════════

# تحديث النظام أولاً
sudo apt update && sudo apt upgrade -y

# تثبيت UFW
sudo apt install ufw -y

# إعادة تعيين UFW (مسح القواعد القديمة)
sudo ufw --force reset

# ─────────────────────────────────────────────
# Default Policies
# ─────────────────────────────────────────────
sudo ufw default deny incoming   # رفض كل الوارد
sudo ufw default allow outgoing  # السماح بكل الصادر
sudo ufw default deny routed     # رفض التوجيه

# ─────────────────────────────────────────────
# ⚠️ مهم: استبدل YOUR_OFFICE_IP بـ IP مكتبك
# ─────────────────────────────────────────────
OFFICE_IP="YOUR_OFFICE_IP"  # مثال: 123.45.67.89

# ─────────────────────────────────────────────
# Port 22 - SSH (⚠️ من IP محدد فقط)
# ─────────────────────────────────────────────
if [ "$OFFICE_IP" != "YOUR_OFFICE_IP" ]; then
  # إذا تم تحديد IP، استخدمه
  sudo ufw allow from $OFFICE_IP to any port 22 proto tcp comment 'SSH from Office'
else
  # مؤقتاً: السماح من كل مكان (⚠️ غير آمن!)
  sudo ufw allow 22/tcp comment 'SSH (change this!)'
  echo "⚠️  تحذير: SSH مفتوح للكل! حدد OFFICE_IP وأعد تشغيل السكريبت"
fi

# ─────────────────────────────────────────────
# Port 80 - HTTP (من الكل)
# ─────────────────────────────────────────────
sudo ufw allow 80/tcp comment 'HTTP'

# ─────────────────────────────────────────────
# Port 443 - HTTPS (من الكل)
# ─────────────────────────────────────────────
sudo ufw allow 443/tcp comment 'HTTPS'

# ─────────────────────────────────────────────
# رفض Port 5432 - PostgreSQL (لا يجب أن يكون مفتوحاً)
# ─────────────────────────────────────────────
sudo ufw deny 5432/tcp comment 'PostgreSQL - Block external'

# ─────────────────────────────────────────────
# رفض Port 3000 - Backend API (داخلي فقط)
# ─────────────────────────────────────────────
sudo ufw deny 3000/tcp comment 'Backend API - Block external'

# ─────────────────────────────────────────────
# تفعيل Logging
# ─────────────────────────────────────────────
sudo ufw logging on

# ─────────────────────────────────────────────
# تفعيل UFW
# ─────────────────────────────────────────────
sudo ufw --force enable

# ─────────────────────────────────────────────
# عرض الحالة
# ─────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════"
echo "✅ تم إعداد Firewall بنجاح!"
echo "════════════════════════════════════════"
sudo ufw status verbose

# ─────────────────────────────────────────────
# جعل UFW يبدأ تلقائياً عند التشغيل
# ─────────────────────────────────────────────
sudo systemctl enable ufw
```

---

## 6️⃣ التحقق من Firewall Rules

### بعد تطبيق القواعد، تحقق:

```bash
# ─────────────────────────────────────────────
# 1. عرض حالة UFW
# ─────────────────────────────────────────────
sudo ufw status verbose

# الناتج المتوقع:
# Status: active
# Logging: on (low)
# Default: deny (incoming), allow (outgoing), deny (routed)
# New profiles: skip
#
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       123.45.67.89
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere

# ─────────────────────────────────────────────
# 2. عرض القواعد برقم
# ─────────────────────────────────────────────
sudo ufw status numbered

# ─────────────────────────────────────────────
# 3. اختبار الاتصال بالـ Ports
# ─────────────────────────────────────────────

# من جهاز آخر، اختبر:
telnet SERVER_IP 80     # يجب أن يتصل
telnet SERVER_IP 443    # يجب أن يتصل
telnet SERVER_IP 22     # يتصل فقط من OFFICE_IP
telnet SERVER_IP 5432   # يجب أن يرفض الاتصال
telnet SERVER_IP 3000   # يجب أن يرفض الاتصال
```

---

## 7️⃣ أوامر UFW المهمة (للإدارة)

### إدارة القواعد:

```bash
# ─────────────────────────────────────────────
# عرض الحالة
# ─────────────────────────────────────────────
sudo ufw status                # مختصر
sudo ufw status verbose        # تفصيلي
sudo ufw status numbered       # مع أرقام القواعد

# ─────────────────────────────────────────────
# إضافة قواعد
# ─────────────────────────────────────────────
sudo ufw allow PORT/PROTOCOL
sudo ufw allow from IP to any port PORT
sudo ufw deny PORT/PROTOCOL

# مثال:
sudo ufw allow 8080/tcp
sudo ufw allow from 1.2.3.4 to any port 22

# ─────────────────────────────────────────────
# حذف قواعد
# ─────────────────────────────────────────────
sudo ufw delete allow 80/tcp
sudo ufw delete RULE_NUMBER    # حسب الرقم من numbered

# ─────────────────────────────────────────────
# تفعيل/تعطيل UFW
# ─────────────────────────────────────────────
sudo ufw enable                # تفعيل
sudo ufw disable               # تعطيل (⚠️ غير آمن!)
sudo ufw reload                # إعادة تحميل

# ─────────────────────────────────────────────
# إعادة تعيين (مسح كل القواعد)
# ─────────────────────────────────────────────
sudo ufw reset                 # يطلب تأكيد
sudo ufw --force reset         # بدون تأكيد

# ─────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────
sudo ufw logging on            # تفعيل
sudo ufw logging off           # تعطيل
sudo ufw logging low           # مستوى منخفض
sudo ufw logging medium        # مستوى متوسط
sudo ufw logging high          # مستوى عالي

# عرض Logs:
sudo tail -f /var/log/ufw.log
```

---

## 8️⃣ Firewall Policies (التفصيل الكامل)

### Default Policies:

```yaml
Incoming (الوارد):
  Policy: DENY (رفض)
  الوصف: رفض كل الاتصالات الواردة افتراضياً
  إلا: الـ Ports المسموح بها صراحة

Outgoing (الصادر):
  Policy: ALLOW (السماح)
  الوصف: السماح بكل الاتصالات الصادرة
  السبب: لتحديثات النظام، DNS، APIs خارجية

Routed (التوجيه):
  Policy: DENY (رفض)
  الوصف: رفض توجيه الحزم بين Interfaces
  السبب: السيرفر ليس Router
```

### Allowed Ports (مسموح):

```yaml
Port 22 (SSH):
  Protocol: TCP
  From: IP محدد فقط (مثال: 123.45.67.89)
  Action: ALLOW
  Priority: عالي ⚠️
  Comment: "SSH from Office only"

Port 80 (HTTP):
  Protocol: TCP
  From: Anywhere (0.0.0.0/0)
  Action: ALLOW
  Priority: متوسط
  Comment: "HTTP traffic"

Port 443 (HTTPS):
  Protocol: TCP
  From: Anywhere (0.0.0.0/0)
  Action: ALLOW
  Priority: عالي
  Comment: "HTTPS traffic"
```

### Blocked Ports (محظور):

```yaml
Port 5432 (PostgreSQL):
  Protocol: TCP
  From: Anywhere
  Action: DENY
  Priority: عالي ⚠️
  Comment: "Database - internal only"

Port 3000 (Backend API):
  Protocol: TCP
  From: Anywhere
  Action: DENY
  Priority: عالي ⚠️
  Comment: "Backend API - internal only"

Port 6379 (Redis):
  Protocol: TCP
  From: Anywhere
  Action: DENY
  Priority: متوسط
  Comment: "Redis - internal only"
```

---

## 9️⃣ أمثلة Firewall Rules حسب السيناريو

### سيناريو 1: مكتب واحد فقط

```bash
# مكتب واحد بـ IP ثابت
OFFICE_IP="123.45.67.89"

sudo ufw default deny incoming
sudo ufw default allow outgoing

sudo ufw allow from $OFFICE_IP to any port 22 comment 'Office SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

sudo ufw enable
```

### سيناريو 2: عدة مكاتب

```bash
# عدة مكاتب بـ IPs مختلفة
OFFICE1_IP="123.45.67.89"
OFFICE2_IP="98.76.54.32"
HOME_IP="111.222.333.444"

sudo ufw default deny incoming
sudo ufw default allow outgoing

sudo ufw allow from $OFFICE1_IP to any port 22 comment 'Office 1 SSH'
sudo ufw allow from $OFFICE2_IP to any port 22 comment 'Office 2 SSH'
sudo ufw allow from $HOME_IP to any port 22 comment 'Admin Home SSH'

sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

sudo ufw enable
```

### سيناريو 3: IP ديناميكي (مؤقت)

```bash
# إذا IP المكتب يتغير (غير آمن!)
sudo ufw default deny incoming
sudo ufw default allow outgoing

sudo ufw allow 22/tcp comment 'SSH - All IPs (temporary)'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

sudo ufw enable

# ⚠️ ملاحظة: يجب تقييد SSH لاحقاً!
```

---

## 🔟 تأمين SSH إضافياً

### إعدادات SSH الموصى بها:

```bash
# تحرير إعدادات SSH
sudo nano /etc/ssh/sshd_config

# ─────────────────────────────────────────────
# التغييرات المطلوبة:
# ─────────────────────────────────────────────

# تعطيل Root Login
PermitRootLogin no

# استخدام SSH Keys فقط (لا Passwords)
PasswordAuthentication no
PubkeyAuthentication yes

# تقليل محاولات المصادقة
MaxAuthTries 3

# تحديد المستخدمين المسموحين
AllowUsers admin your_username

# تعطيل X11 Forwarding
X11Forwarding no

# Timeout Settings
ClientAliveInterval 300
ClientAliveCountMax 2

# تغيير Port SSH (اختياري لكن مستحسن)
# Port 2222

# ─────────────────────────────────────────────
# حفظ والخروج: Ctrl+X ثم Y ثم Enter
# ─────────────────────────────────────────────

# إعادة تشغيل SSH
sudo systemctl restart sshd

# التحقق من الحالة
sudo systemctl status sshd
```

---

## 1️⃣1️⃣ Fail2Ban (حماية إضافية)

### تثبيت وإعداد Fail2Ban:

```bash
# ─────────────────────────────────────────────
# التثبيت
# ─────────────────────────────────────────────
sudo apt update
sudo apt install fail2ban -y

# ─────────────────────────────────────────────
# إنشاء ملف الإعداد المحلي
# ─────────────────────────────────────────────
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# تحرير الإعدادات
sudo nano /etc/fail2ban/jail.local

# ─────────────────────────────────────────────
# الإعدادات الموصى بها:
# ─────────────────────────────────────────────
[DEFAULT]
bantime  = 3600        # ساعة واحدة
findtime = 600         # 10 دقائق
maxretry = 3           # 3 محاولات فاشلة

[sshd]
enabled = true
port    = 22
logpath = /var/log/auth.log
maxretry = 3

# ─────────────────────────────────────────────
# حفظ والخروج
# ─────────────────────────────────────────────

# تفعيل Fail2Ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# التحقق من الحالة
sudo systemctl status fail2ban

# عرض IPs المحظورة
sudo fail2ban-client status sshd
```

---

## 1️⃣2️⃣ Monitoring و Logs

### مراقبة Firewall:

```bash
# ─────────────────────────────────────────────
# عرض Firewall Logs
# ─────────────────────────────────────────────
sudo tail -f /var/log/ufw.log

# عرض محاولات SSH الفاشلة
sudo grep "Failed password" /var/log/auth.log

# عرض محاولات SSH الناجحة
sudo grep "Accepted" /var/log/auth.log

# ─────────────────────────────────────────────
# مراقبة الاتصالات النشطة
# ─────────────────────────────────────────────
sudo ss -tuln        # عرض Ports المفتوحة
sudo netstat -tuln   # بديل

# عرض اتصالات محددة
sudo ss -tunp | grep :80
sudo ss -tunp | grep :443
sudo ss -tunp | grep :22
```

---

## 1️⃣3️⃣ Checklist للعميل

### قبل تشغيل VPS:

- [ ] تثبيت Ubuntu 22.04 LTS
- [ ] تحديث النظام: `sudo apt update && sudo apt upgrade -y`
- [ ] تثبيت UFW: `sudo apt install ufw -y`
- [ ] إعداد Default Policies (deny incoming, allow outgoing)
- [ ] تحديد IP المكتب/المنزل
- [ ] السماح بـ SSH من IP محدد فقط
- [ ] السماح بـ HTTP (80) و HTTPS (443)
- [ ] حظر PostgreSQL (5432) و Backend (3000)
- [ ] تفعيل UFW: `sudo ufw enable`
- [ ] التحقق: `sudo ufw status verbose`
- [ ] تأمين SSH: تعطيل root، استخدام keys
- [ ] تثبيت Fail2Ban
- [ ] اختبار الاتصال من الخارج
- [ ] مراجعة Logs

---

## 1️⃣4️⃣ ملخص سريع للعميل

### الإجابة المختصرة:

```yaml
نظام التشغيل:
  ✅ Ubuntu 22.04 LTS (Jammy Jellyfish)
  ✅ 64-bit Server Edition

Firewall:
  الأداة: UFW (Uncomplicated Firewall)
  مدمج في: Ubuntu (لا يحتاج تثبيت إضافي)

Default Policies:
  Incoming: DENY (رفض الكل)
  Outgoing: ALLOW (السماح بالكل)

Ports المسموحة:
  ✅ Port 22  (SSH)   - من IP محدد فقط
  ✅ Port 80  (HTTP)  - من الكل
  ✅ Port 443 (HTTPS) - من الكل

Ports المحظورة:
  ❌ Port 5432 (PostgreSQL) - داخلي فقط
  ❌ Port 3000 (Backend)    - داخلي فقط
```

---

## 1️⃣5️⃣ سكريبت الإعداد الكامل (للنسخ واللصق)

### حفظ هذا في ملف: `setup-firewall.sh`

```bash
#!/bin/bash
# ══════════════════════════════════════════════════════
# إعداد Firewall الكامل - Ubuntu 22.04 LTS
# ══════════════════════════════════════════════════════

echo "════════════════════════════════════════"
echo "🔐 إعداد Firewall للمشروع"
echo "════════════════════════════════════════"

# ⚠️ حدد IP مكتبك هنا:
OFFICE_IP="YOUR_OFFICE_IP"  # استبدل بـ IP الحقيقي

# تحديث النظام
echo "📦 تحديث النظام..."
sudo apt update && sudo apt upgrade -y

# تثبيت UFW
echo "🔧 تثبيت UFW..."
sudo apt install ufw -y

# إعادة تعيين
echo "🔄 إعادة تعيين القواعد..."
sudo ufw --force reset

# Default Policies
echo "⚙️  إعداد Default Policies..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw default deny routed

# SSH
echo "🔐 إعداد SSH Access..."
if [ "$OFFICE_IP" != "YOUR_OFFICE_IP" ]; then
  sudo ufw allow from $OFFICE_IP to any port 22 proto tcp comment 'SSH from Office'
  echo "✅ SSH مسموح من: $OFFICE_IP"
else
  sudo ufw allow 22/tcp comment 'SSH (ALL - Change this!)'
  echo "⚠️  تحذير: SSH مفتوح للكل!"
fi

# HTTP & HTTPS
echo "🌐 إعداد Web Access..."
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Block Database
echo "🔒 حظر Database Ports..."
sudo ufw deny 5432/tcp comment 'PostgreSQL - Blocked'
sudo ufw deny 3000/tcp comment 'Backend API - Blocked'

# Logging
echo "📝 تفعيل Logging..."
sudo ufw logging on

# تفعيل
echo "✅ تفعيل UFW..."
sudo ufw --force enable
sudo systemctl enable ufw

# عرض النتيجة
echo ""
echo "════════════════════════════════════════"
echo "✅ تم إعداد Firewall بنجاح!"
echo "════════════════════════════════════════"
sudo ufw status verbose

echo ""
echo "════════════════════════════════════════"
echo "📋 الخطوات التالية:"
echo "════════════════════════════════════════"
echo "1. تثبيت Fail2Ban: sudo apt install fail2ban -y"
echo "2. تأمين SSH: /etc/ssh/sshd_config"
echo "3. اختبار الاتصال من جهاز خارجي"
echo "════════════════════════════════════════"
```

### تشغيل السكريبت:

```bash
# نسخ السكريبت إلى السيرفر
nano setup-firewall.sh
# الصق المحتوى أعلاه

# إعطاء صلاحية التنفيذ
chmod +x setup-firewall.sh

# تشغيل
sudo ./setup-firewall.sh
```

---

## 🎯 الخلاصة النهائية

```yaml
OS: Ubuntu 22.04 LTS ✅
Firewall: UFW ✅
Ports: 22, 80, 443 (فقط) ✅
Security: SSH Keys + Fail2Ban ✅
```

**كل شيء جاهز! 🚀**
